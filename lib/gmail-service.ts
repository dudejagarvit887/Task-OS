'use server'

import { auth, clerkClient } from '@clerk/nextjs/server'
import type { gmail_v1 } from 'googleapis'
import { google } from 'googleapis'

interface EmailData {
	sender?: string
	senderEmail?: string
	subject?: string
	preview?: string
	receivedAt?: string
	isUrgent?: boolean
	category?: string
	hasAttachments?: boolean
}

interface GmailTokens {
	access_token: string
	refresh_token?: string
	expiry_date?: number
	token_type?: string
	scope?: string
}

interface OrgPrivateMetadata {
	gmailTokens?: GmailTokens
}

/**
 * Creates an authenticated Gmail API client for the given organization
 */
async function getGmailClient(orgId: string) {
	const client = await clerkClient()

	// Get organization
	const org = await client.organizations.getOrganization({
		organizationId: orgId,
	})

	const privateMetadata = (org.privateMetadata ?? {}) as OrgPrivateMetadata
	const tokens = privateMetadata.gmailTokens

	if (!tokens?.access_token) {
		throw new Error('No Google OAuth token found. Please connect Google first.')
	}

	// Create OAuth2 client with credentials
	const oauth2Client = new google.auth.OAuth2(
		process.env.GOOGLE_CLIENT_ID,
		process.env.GOOGLE_CLIENT_SECRET,
		`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/google/callback`
	)

	// Set credentials
	oauth2Client.setCredentials({
		access_token: tokens.access_token,
		refresh_token: tokens.refresh_token,
		expiry_date: tokens.expiry_date,
		token_type: tokens.token_type,
		scope: tokens.scope,
	})

	// Handle token refresh
	oauth2Client.on('tokens', async (newTokens) => {
		console.log('Refreshing Gmail tokens...')

		// Update stored tokens with new access token
		const updatedTokens: GmailTokens = {
			...tokens,
			access_token: newTokens.access_token || tokens.access_token,
			expiry_date: newTokens.expiry_date || tokens.expiry_date,
		}

		// If new refresh token provided, update it
		if (newTokens.refresh_token) {
			updatedTokens.refresh_token = newTokens.refresh_token
		}

		// Save updated tokens to privateMetadata
		await client.organizations.updateOrganizationMetadata(orgId, {
			privateMetadata: {
				...privateMetadata,
				gmailTokens: updatedTokens,
			},
		})
	})

	// Return Gmail API client
	return google.gmail({ version: 'v1', auth: oauth2Client })
}

/**
 * Parses Gmail API message headers to extract sender, subject, date
 */
function parseHeaders(headers: gmail_v1.Schema$MessagePartHeader[] = []) {
	const getHeader = (name: string) => {
		return (
			headers.find((h) => h.name?.toLowerCase() === name.toLowerCase())
				?.value ?? undefined
		)
	}

	const from = getHeader('From') || ''
	const subject = getHeader('Subject') || 'No subject'
	const date = getHeader('Date') || ''

	// Parse sender name and email from "Name <email@example.com>" format
	const senderMatch = from.match(/^(.*?)\s*<(.+?)>$/)
	const senderName = senderMatch ? senderMatch[1].trim() : from
	const senderEmail = senderMatch ? senderMatch[2].trim() : from

	return {
		sender: senderName || senderEmail,
		senderEmail,
		subject,
		date,
	}
}

/**
 * Extracts plain text body from Gmail message
 */
function extractBody(payload?: gmail_v1.Schema$MessagePart): string {
	if (!payload) return ''

	// If payload has direct body data
	if (payload.body?.data) {
		return Buffer.from(payload.body.data, 'base64').toString('utf-8')
	}

	// If payload has parts (multipart message)
	if (payload.parts && payload.parts.length > 0) {
		// Try to find text/plain part first
		const textPart = payload.parts.find((p) => p.mimeType === 'text/plain')
		if (textPart?.body?.data) {
			return Buffer.from(textPart.body.data, 'base64').toString('utf-8')
		}

		// Fallback to text/html
		const htmlPart = payload.parts.find((p) => p.mimeType === 'text/html')
		if (htmlPart?.body?.data) {
			const html = Buffer.from(htmlPart.body.data, 'base64').toString('utf-8')
			// Strip HTML tags for preview
			return html
				.replaceAll(/<[^>]*>/g, ' ')
				.replaceAll(/\s+/g, ' ')
				.trim()
		}

		// Check nested parts (multipart/alternative, etc.)
		for (const part of payload.parts) {
			if (part.parts && part.parts.length > 0) {
				const nestedText = part.parts.find((p) => p.mimeType === 'text/plain')
				if (nestedText?.body?.data) {
					return Buffer.from(nestedText.body.data, 'base64').toString('utf-8')
				}
			}
		}
	}

	return ''
}

/**
 * Formats a date string to human-readable format
 */
function formatDate(dateString: string): string {
	if (!dateString) return ''

	try {
		const date = new Date(dateString)
		const now = new Date()
		const diffMs = now.getTime() - date.getTime()
		const diffMins = Math.floor(diffMs / 60000)
		const diffHours = Math.floor(diffMs / 3600000)
		const diffDays = Math.floor(diffMs / 86400000)

		if (diffMins < 1) return 'Just now'
		if (diffMins < 60) return `${diffMins}m ago`
		if (diffHours < 24) return `${diffHours}h ago`
		if (diffDays < 7) return `${diffDays}d ago`

		// Format as "Jan 15" for older emails
		return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
	} catch {
		return dateString
	}
}

/**
 * Determines if an email is urgent based on subject, sender, or labels
 */
function isEmailUrgent(
	subject: string,
	labels: string[] = [],
	snippet: string = ''
): boolean {
	const urgentKeywords = [
		'urgent',
		'asap',
		'immediate',
		'critical',
		'emergency',
		'important',
		'action required',
	]

	const text = `${subject} ${snippet}`.toLowerCase()

	// Check for urgent keywords
	const hasUrgentKeyword = urgentKeywords.some((keyword) =>
		text.includes(keyword)
	)

	// Check for IMPORTANT label
	const hasImportantLabel = labels.includes('IMPORTANT')

	return hasUrgentKeyword || hasImportantLabel
}

/**
 * Categorizes email based on labels or content
 */
function categorizeEmail(labels: string[] = []): string | undefined {
	// Map Gmail labels to categories
	const categoryMap: { [key: string]: string } = {
		CATEGORY_PERSONAL: 'Personal',
		CATEGORY_SOCIAL: 'Social',
		CATEGORY_PROMOTIONS: 'Promotions',
		CATEGORY_UPDATES: 'Updates',
		CATEGORY_FORUMS: 'Forums',
		IMPORTANT: 'Important',
	}

	for (const label of labels) {
		if (categoryMap[label]) {
			return categoryMap[label]
		}
	}

	return undefined
}

/**
 * Parses a Gmail API message into EmailData format
 */
function parseEmailMessage(message: gmail_v1.Schema$Message): EmailData {
	const headers = message.payload?.headers || []
	const { sender, senderEmail, subject, date } = parseHeaders(headers)

	// Extract body and create preview (first 150 chars)
	const body = extractBody(message.payload)
	const preview =
		message.snippet ||
		body.substring(0, 150).replace(/\s+/g, ' ').trim() ||
		'No preview available'

	// Format date
	const receivedAt = formatDate(date)

	// Check for attachments
	const hasAttachments = message.payload?.parts?.some(
		(part) => part.body?.data || part.parts
	)

	// Determine urgency and category
	const labels = message.labelIds || []
	const isUrgent = isEmailUrgent(subject, labels, message.snippet || '')
	const category = categorizeEmail(labels)

	return {
		sender,
		senderEmail,
		subject,
		preview,
		receivedAt,
		isUrgent,
		category,
		hasAttachments,
	}
}

/**
 * Fetches the latest emails from Gmail
 */
export async function fetchLatestEmails(
	limit: number = 10
): Promise<EmailData[]> {
	try {
		// Get orgId from current auth
		const { orgId } = await auth()
		if (!orgId) {
			throw new Error('No organization found')
		}

		const gmail = await getGmailClient(orgId)

		// List messages
		const response = await gmail.users.messages.list({
			userId: 'me',
			maxResults: limit,
			labelIds: ['INBOX'],
		})

		const messages = response.data.messages || []

		if (messages.length === 0) {
			return []
		}

		// Fetch full message details for each message
		const emailPromises = messages.map(async (message) => {
			const fullMessage = await gmail.users.messages.get({
				userId: 'me',
				id: message.id || '',
				format: 'full',
			})
			return parseEmailMessage(fullMessage.data)
		})

		const emails = await Promise.all(emailPromises)
		return emails
	} catch (error) {
		console.error('Error fetching emails:', error)

		if (error instanceof Error) {
			if (error.message.includes('invalid_grant')) {
				throw new Error(
					'Google connection expired. Please reconnect Google in Link Integration.'
				)
			}
		}

		throw new Error('Failed to fetch emails from Gmail.')
	}
}

/**
 * Searches emails with Gmail query syntax
 */
export async function searchEmails(query: string): Promise<EmailData[]> {
	try {
		// Get orgId from current auth
		const { orgId } = await auth()
		if (!orgId) {
			throw new Error('No organization found')
		}

		const gmail = await getGmailClient(orgId)

		// Search messages
		const response = await gmail.users.messages.list({
			userId: 'me',
			q: query,
			maxResults: 20,
		})

		const messages = response.data.messages || []

		if (messages.length === 0) {
			return []
		}

		// Fetch full message details
		const emailPromises = messages.map(async (message) => {
			const fullMessage = await gmail.users.messages.get({
				userId: 'me',
				id: message.id || '',
				format: 'full',
			})
			return parseEmailMessage(fullMessage.data)
		})

		const emails = await Promise.all(emailPromises)
		return emails
	} catch (error) {
		console.error('Error searching emails:', error)

		if (error instanceof Error) {
			if (error.message.includes('invalid_grant')) {
				throw new Error(
					'Google connection expired. Please reconnect Google in Link Integration.'
				)
			}
		}

		throw new Error('Failed to search emails.')
	}
}
