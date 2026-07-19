'use client'

import {
	GenerationStage,
	useTambo,
	useTamboThreadInput,
	useTamboVoice,
} from '@tambo-ai/react'
import { useCallback, useEffect, useRef, useState } from 'react'

export type VoiceChatState =
	| 'idle'
	| 'recording'
	| 'transcribing'
	| 'submitting'
	| 'waiting_response'
	| 'playing_audio'

export interface UseVoiceChatOptions {
	/** Enable TTS for all assistant responses, not just voice-initiated ones */
	enableAutoTTS?: boolean
}

export function useVoiceChat(options: UseVoiceChatOptions = {}) {
	const { enableAutoTTS = false } = options
	const [state, setState] = useState<VoiceChatState>('idle')
	const [error, setError] = useState<string | null>(null)

	const {
		startRecording,
		stopRecording,
		isRecording,
		isTranscribing,
		transcript,
		transcriptionError,
		mediaAccessError,
	} = useTamboVoice()
	const { setValue, submit } = useTamboThreadInput()
	const { thread, isIdle } = useTambo()

	const audioRef = useRef<HTMLAudioElement | null>(null)
	const abortControllerRef = useRef<AbortController | null>(null)
	const lastTranscriptRef = useRef<string>('')
	const isVoiceFlowActiveRef = useRef(false)
	const lastPlayedMessageIdRef = useRef<string | null>(null)
	const isPlayingRef = useRef(false)

	const toggleRecording = useCallback(() => {
		if (state === 'recording') {
			stopRecording()
		} else if (state === 'idle') {
			setError(null)
			lastTranscriptRef.current = ''
			isVoiceFlowActiveRef.current = true
			startRecording()
			setState('recording')
		}
	}, [state, startRecording, stopRecording])

	// Track recording -> transcribing transition
	useEffect(() => {
		if (
			isVoiceFlowActiveRef.current &&
			isTranscribing &&
			state === 'recording'
		) {
			setState('transcribing')
		}
	}, [isTranscribing, state])

	// Handle transcript arrival -> auto-submit
	useEffect(() => {
		if (
			!isVoiceFlowActiveRef.current ||
			!transcript ||
			transcript === lastTranscriptRef.current
		) {
			return
		}
		lastTranscriptRef.current = transcript

		const autoSubmit = async () => {
			setState('submitting')
			setValue(transcript)
			try {
				await submit({ streamResponse: true })
				setValue('')
				setState('waiting_response')
			} catch (err) {
				console.error('Voice auto-submit failed:', err)
				setError(err instanceof Error ? err.message : 'Failed to send message')
				setState('idle')
				isVoiceFlowActiveRef.current = false
			}
		}

		autoSubmit()
	}, [transcript, setValue, submit])

	// Process streaming JSON lines and extract audio chunks
	const processStreamChunks = useCallback(
		async (
			reader: ReadableStreamDefaultReader<Uint8Array>
		): Promise<Uint8Array[]> => {
			const audioChunks: Uint8Array[] = []
			const decoder = new TextDecoder()
			let buffer = ''
			let chunkCount = 0

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
							chunkCount++
							console.log(`TTS chunk ${chunkCount}: ${bytes.length} bytes`)
						}
					} catch (error) {
						console.warn('Failed to parse streaming chunk:', error)
					}
				}
			}

			console.log(`TTS streaming complete: ${chunkCount} chunks received`)
			return audioChunks
		},
		[]
	)

	// Helper function to fetch and decode streaming TTS audio
	const fetchStreamingAudio = useCallback(
		async (
			text: string,
			apiKey: string,
			signal: AbortSignal
		): Promise<Uint8Array> => {
			const response = await fetch(
				'https://api.inworld.ai/tts/v1/voice:stream',
				{
					method: 'POST',
					headers: {
						Authorization: `Basic ${apiKey}`,
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						text: text.slice(0, 5000),
						voice_id: 'Dennis',
						audio_config: {
							audio_encoding: 'MP3',
							speaking_rate: 1,
						},
						temperature: 1.1,
						model_id: 'inworld-tts-1.5-max',
					}),
					signal,
				}
			)

			if (!response.ok) {
				const errorText = await response.text()
				console.error('Inworld API error:', errorText)
				throw new Error(`TTS request failed: ${response.status}`)
			}

			if (!response.body) {
				throw new Error('No response body for streaming')
			}

			console.log('Starting TTS streaming...')

			// Process streaming chunks
			const audioChunks = await processStreamChunks(response.body.getReader())

			// Combine all chunks
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

			console.log(`Total TTS audio: ${combinedAudio.length} bytes`)
			return combinedAudio
		},
		[processStreamChunks]
	)

	const playTTS = useCallback(
		async (text: string, messageId: string) => {
			// Prevent duplicate plays
			if (
				isPlayingRef.current ||
				lastPlayedMessageIdRef.current === messageId
			) {
				return
			}

			isPlayingRef.current = true
			lastPlayedMessageIdRef.current = messageId
			setState('playing_audio')

			const controller = new AbortController()
			abortControllerRef.current = controller

			try {
				const apiKey = process.env.NEXT_PUBLIC_INWORLD_API_KEY
				if (!apiKey) {
					throw new Error('INWORLD_API_KEY not configured')
				}

				// Fetch streaming audio
				const audioData = await fetchStreamingAudio(
					text,
					apiKey,
					controller.signal
				)

				// Create audio blob and play
				const audioBlob = new Blob([audioData as BlobPart], {
					type: 'audio/mpeg',
				})
				const audioUrl = URL.createObjectURL(audioBlob)

				const audio = new Audio(audioUrl)
				audioRef.current = audio

				audio.onloadeddata = () => {
					console.log('Audio loaded successfully, duration:', audio.duration)
				}

				audio.onended = () => {
					URL.revokeObjectURL(audioUrl)
					audioRef.current = null
					isPlayingRef.current = false
					setState('idle')
					isVoiceFlowActiveRef.current = false
				}

				audio.onerror = (e) => {
					console.error('Audio playback error:', e, audio.error)
					URL.revokeObjectURL(audioUrl)
					audioRef.current = null
					isPlayingRef.current = false
					setError('Audio playback failed')
					setState('idle')
					isVoiceFlowActiveRef.current = false
				}

				await audio.play()
				console.log('Audio playback started')
			} catch (err) {
				if ((err as Error).name === 'AbortError') {
					isPlayingRef.current = false
					return
				}
				console.error('TTS error:', err)
				setError(err instanceof Error ? err.message : 'TTS failed')
				isPlayingRef.current = false
				setState('idle')
				isVoiceFlowActiveRef.current = false
			}
		},
		[fetchStreamingAudio]
	)

	// Detect response completion -> trigger TTS
	useEffect(() => {
		// Only trigger TTS if:
		// 1. In voice flow waiting for response, OR
		// 2. Auto-TTS is enabled and we're idle
		const shouldMonitorForTTS =
			(state === 'waiting_response' && isVoiceFlowActiveRef.current) ||
			(enableAutoTTS && state === 'idle')

		if (!shouldMonitorForTTS) return
		if (isPlayingRef.current) return // Already playing

		const stage = thread?.generationStage
		if (stage !== GenerationStage.COMPLETE && stage !== GenerationStage.IDLE) {
			return
		}
		if (!isIdle) return

		const messages = thread?.messages ?? []
		if (messages.length === 0) return

		const lastMessage = messages.at(-1)
		if (lastMessage?.role !== 'assistant') return

		// Check if we've already played this message
		const messageId = lastMessage.id
		if (!messageId || lastPlayedMessageIdRef.current === messageId) {
			return
		}

		// Extract text content
		const content = lastMessage.content
		let textContent = ''
		if (typeof content === 'string') {
			textContent = content
		} else if (Array.isArray(content)) {
			interface ContentItem {
				type?: string
				text?: string
			}
			textContent = content
				.filter((item: ContentItem) => item?.type === 'text')
				.map((item: ContentItem) => item.text ?? '')
				.join(' ')
		}

		if (!textContent.trim()) {
			if (isVoiceFlowActiveRef.current) {
				setState('idle')
				isVoiceFlowActiveRef.current = false
			}
			return
		}

		playTTS(textContent, messageId)
	}, [
		thread?.generationStage,
		thread?.messages,
		isIdle,
		state,
		enableAutoTTS,
		playTTS,
	])

	const stop = useCallback(() => {
		if (isRecording) stopRecording()
		abortControllerRef.current?.abort()
		if (audioRef.current) {
			audioRef.current.pause()
			audioRef.current = null
		}
		isPlayingRef.current = false
		setState('idle')
		setError(null)
		isVoiceFlowActiveRef.current = false
	}, [isRecording, stopRecording])

	// Handle transcription/media errors
	useEffect(() => {
		if (transcriptionError && isVoiceFlowActiveRef.current) {
			setError(transcriptionError)
			setState('idle')
			isVoiceFlowActiveRef.current = false
		}
	}, [transcriptionError])

	useEffect(() => {
		if (mediaAccessError && isVoiceFlowActiveRef.current) {
			setError('Microphone access denied')
			setState('idle')
			isVoiceFlowActiveRef.current = false
		}
	}, [mediaAccessError])

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			abortControllerRef.current?.abort()
			if (audioRef.current) {
				audioRef.current.pause()
			}
		}
	}, [])

	return {
		state,
		error,
		toggleRecording,
		stop,
		isActive: state !== 'idle',
	}
}
