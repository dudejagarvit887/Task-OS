'use client'

import { GenerationStage, useTambo } from '@tambo-ai/react'
import { useCallback, useEffect, useRef } from 'react'
import { cleanMarkdownForTTS } from '@/lib/text-utils'

/**
 * StreamingTTSPlayer component that plays TTS audio in real-time
 * as Tambo streams the response text, sentence by sentence.
 */
export function StreamingTTSPlayer() {
	const { thread } = useTambo()
	const processedTextRef = useRef('')
	const audioQueueRef = useRef<HTMLAudioElement[]>([])
	const isPlayingQueueRef = useRef(false)
	const currentMessageIdRef = useRef<string | null>(null)

	// Extract sentences from text (split on . ! ? followed by space or end)
	const extractSentences = useCallback((text: string): string[] => {
		// Match sentences ending with . ! ? followed by space, newline, or end of string
		const sentences = text
			.split(/([.!?]+(?:\s+|$))/)
			.reduce((acc: string[], part, i, arr) => {
				if (i % 2 === 0 && part.trim()) {
					// Combine text with its punctuation
					const sentence = (part + (arr[i + 1] || '')).trim()
					if (sentence) acc.push(sentence)
				}
				return acc
			}, [])
		return sentences
	}, [])

	// Process streaming response lines and extract audio chunks
	const processStreamResponse = useCallback(
		async (
			reader: ReadableStreamDefaultReader<Uint8Array>
		): Promise<Uint8Array[]> => {
			const audioChunks: Uint8Array[] = []
			const decoder = new TextDecoder()
			let buffer = ''

			while (true) {
				const { done, value } = await reader.read()
				if (done) break

				buffer += decoder.decode(value, { stream: true })
				const lines = buffer.split('\n')
				buffer = lines.pop() || ''

				for (const line of lines) {
					if (!line.trim()) continue
					try {
						const chunkData = JSON.parse(line)
						if (chunkData.result?.audioContent) {
							const binaryString = atob(chunkData.result.audioContent)
							const bytes = Uint8Array.from(
								binaryString,
								(c) => c.codePointAt(0) ?? 0
							)
							audioChunks.push(bytes)
						}
					} catch (error) {
						console.warn('TTS chunk parse error:', error)
					}
				}
			}

			return audioChunks
		},
		[]
	)

	// Fetch TTS audio for a sentence
	const fetchSentenceAudio = useCallback(
		async (sentence: string): Promise<Uint8Array | null> => {
			try {
				const apiKey = process.env.NEXT_PUBLIC_INWORLD_API_KEY
				if (!apiKey) {
					console.error('INWORLD_API_KEY not configured')
					return null
				}

				// Clean markdown formatting from the sentence before sending to TTS
				const cleanedSentence = cleanMarkdownForTTS(sentence)

				// Skip if the cleaned sentence is empty or too short
				if (!cleanedSentence || cleanedSentence.trim().length < 2) {
					return null
				}

				const response = await fetch(
					'https://api.inworld.ai/tts/v1/voice:stream',
					{
						method: 'POST',
						headers: {
							Authorization: `Basic ${apiKey}`,
							'Content-Type': 'application/json',
						},
						body: JSON.stringify({
							text: cleanedSentence,
							voice_id: 'Dennis',
							audio_config: {
								audio_encoding: 'MP3',
								speaking_rate: 1,
							},
							temperature: 1.1,
							model_id: 'inworld-tts-1.5-max',
						}),
					}
				)

				if (!response.ok || !response.body) return null

				// Collect streaming audio chunks
				const audioChunks = await processStreamResponse(
					response.body.getReader()
				)

				// Combine chunks
				const totalLength = audioChunks.reduce(
					(sum, chunk) => sum + chunk.length,
					0
				)
				const combinedAudio = new Uint8Array(totalLength)
				let offset = 0
				for (const chunk of audioChunks) {
					combinedAudio.set(chunk, offset)
					offset += chunk.length
				}

				return combinedAudio
			} catch (error) {
				console.error('TTS fetch error:', error)
				return null
			}
		},
		[processStreamResponse]
	)

	// Play next audio in queue
	const playNextInQueue = useCallback(() => {
		if (audioQueueRef.current.length === 0) {
			isPlayingQueueRef.current = false
			return
		}

		isPlayingQueueRef.current = true
		const audio = audioQueueRef.current.shift()
		if (!audio) return

		audio.onended = () => {
			URL.revokeObjectURL(audio.src)
			playNextInQueue()
		}

		audio.onerror = () => {
			URL.revokeObjectURL(audio.src)
			console.error('Audio playback error')
			playNextInQueue()
		}

		audio.play().catch((error) => {
			console.error('Audio play error:', error)
			playNextInQueue()
		})
	}, [])

	// Queue audio for playback
	const queueAudio = useCallback(
		async (audioData: Uint8Array) => {
			const audioBlob = new Blob([audioData as BlobPart], {
				type: 'audio/mpeg',
			})
			const audioUrl = URL.createObjectURL(audioBlob)
			const audio = new Audio(audioUrl)

			audioQueueRef.current.push(audio)

			// Start playing queue if not already playing
			if (!isPlayingQueueRef.current) {
				playNextInQueue()
			}
		},
		[playNextInQueue]
	)

	// Monitor streaming messages and trigger TTS for new sentences
	useEffect(() => {
		const stage = thread?.generationStage
		const messages = thread?.messages ?? []

		// Only process during streaming or when complete
		if (
			stage !== GenerationStage.STREAMING_RESPONSE &&
			stage !== GenerationStage.COMPLETE
		) {
			return
		}

		const lastMessage = messages.at(-1)
		if (lastMessage?.role !== 'assistant') return

		// Reset if new message
		if (lastMessage.id !== currentMessageIdRef.current) {
			currentMessageIdRef.current = lastMessage.id
			processedTextRef.current = ''
		}

		// Extract current text content
		const content = lastMessage.content
		let currentText = ''
		if (typeof content === 'string') {
			currentText = content
		} else if (Array.isArray(content)) {
			interface ContentItem {
				type?: string
				text?: string
			}
			currentText = content
				.filter((item: ContentItem) => item?.type === 'text')
				.map((item: ContentItem) => item.text ?? '')
				.join(' ')
		}

		if (!currentText) return

		// Find new text that hasn't been processed
		if (currentText.length <= processedTextRef.current.length) return

		const newText = currentText.slice(processedTextRef.current.length)
		const fullTextSoFar = processedTextRef.current + newText

		// Extract complete sentences from the full text
		const allSentences = extractSentences(fullTextSoFar)

		// If streaming, only process complete sentences (leave incomplete at end)
		const sentencesToProcess =
			stage === GenerationStage.STREAMING_RESPONSE
				? allSentences.slice(0, -1) // Keep last sentence for next update
				: allSentences // Process all when complete

		// Determine how many sentences we've already processed
		const processedSentences = extractSentences(processedTextRef.current)
		const newSentences = sentencesToProcess.slice(processedSentences.length)

		// Fetch and queue TTS for new sentences
		for (const sentence of newSentences) {
			console.log('TTS queuing sentence:', sentence)
			fetchSentenceAudio(sentence).then((audioData) => {
				if (audioData) {
					queueAudio(audioData)
				}
			})
		}

		// Update processed text to include all processed sentences
		const processedText = sentencesToProcess.join(' ')
		processedTextRef.current = processedText
	}, [
		thread?.generationStage,
		thread?.messages,
		extractSentences,
		fetchSentenceAudio,
		queueAudio,
	])

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			audioQueueRef.current.forEach((audio) => {
				audio.pause()
				URL.revokeObjectURL(audio.src)
			})
			audioQueueRef.current = []
		}
	}, [])

	return null
}
