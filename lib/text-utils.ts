/**
 * Utility functions for text processing, particularly for TTS (Text-to-Speech) conversion
 */

/**
 * Cleans markdown formatting from text to make it more suitable for TTS.
 * Removes markdown symbols while preserving the actual content and natural speech flow.
 *
 * @param text - The markdown text to clean
 * @returns Clean text suitable for speech synthesis
 */
export function cleanMarkdownForTTS(text: string): string {
	if (!text) return text

	let cleaned = text

	// Remove code blocks (``` or `)
	cleaned = cleaned.replace(/```[\s\S]*?```/g, ' code block ')
	cleaned = cleaned.replace(/`([^`]+)`/g, '$1')

	// Remove bold and italic (**, __, *, _)
	cleaned = cleaned.replace(/\*\*([^*]+)\*\*/g, '$1')
	cleaned = cleaned.replace(/__([^_]+)__/g, '$1')
	cleaned = cleaned.replace(/\*([^*]+)\*/g, '$1')
	cleaned = cleaned.replace(/_([^_]+)_/g, '$1')

	// Remove headers (# ## ### etc.) but keep the text
	cleaned = cleaned.replace(/^#{1,6}\s+/gm, '')

	// Remove strikethrough (~~text~~)
	cleaned = cleaned.replace(/~~([^~]+)~~/g, '$1')

	// Convert bullet points to natural speech
	// - item -> item
	cleaned = cleaned.replace(/^\s*[-*+]\s+/gm, '')

	// Convert numbered lists to natural speech
	// 1. item -> item
	// 2. item -> item
	cleaned = cleaned.replace(/^\s*\d+\.\s+/gm, '')

	// Remove links but keep the text
	// [text](url) -> text
	cleaned = cleaned.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')

	// Remove image markdown
	// ![alt](url) -> alt
	cleaned = cleaned.replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')

	// Remove blockquotes (>)
	cleaned = cleaned.replace(/^\s*>\s+/gm, '')

	// Remove horizontal rules (---, ***, ___)
	cleaned = cleaned.replace(/^[\s]*[-*_]{3,}[\s]*$/gm, ' ')

	// Remove HTML tags (basic cleaning)
	cleaned = cleaned.replace(/<[^>]+>/g, '')

	// Convert multiple newlines to single space
	cleaned = cleaned.replace(/\n\s*\n/g, '. ')

	// Convert single newlines to spaces
	cleaned = cleaned.replace(/\n/g, ' ')

	// Clean up multiple spaces
	cleaned = cleaned.replace(/\s+/g, ' ')

	// Trim whitespace
	cleaned = cleaned.trim()

	return cleaned
}

/**
 * Prepares text for natural speech by adding appropriate pauses and emphasis
 *
 * @param text - The text to prepare for speech
 * @returns Text with natural speech patterns
 */
export function prepareForNaturalSpeech(text: string): string {
	let prepared = cleanMarkdownForTTS(text)

	// Add natural pauses at sentence boundaries
	prepared = prepared.replace(/\.\s+/g, '. ')
	prepared = prepared.replace(/\?\s+/g, '? ')
	prepared = prepared.replace(/!\s+/g, '! ')

	// Ensure proper spacing around commas
	prepared = prepared.replace(/,\s*/g, ', ')

	return prepared
}
