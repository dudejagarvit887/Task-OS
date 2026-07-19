import type { TamboTool } from '@tambo-ai/react'
import { z } from 'zod'
import {
	getLatestEmails,
	searchGmailEmails,
} from '@/app/(protected)/dashboard/gmail-actions'
import { checkGmailConnection } from '@/components/link-integration-dialog/oauth-actions'

// Email data schema for output
const emailSchema = z.object({
	sender: z.string().optional(),
	senderEmail: z.string().optional(),
	subject: z.string().optional(),
	preview: z.string().optional(),
	receivedAt: z.string().optional(),
	isUrgent: z.boolean().optional(),
	category: z.string().optional(),
	hasAttachments: z.boolean().optional(),
})

// Tool function for getting latest emails
async function getLatestEmailsTool({ limit }: { limit: number }) {
	// Check if Gmail is connected
	const isConnected = await checkGmailConnection()
	if (!isConnected) {
		throw new Error(
			'Google is not connected. Please connect Google in Link Integration settings.'
		)
	}

	try {
		const emails = await getLatestEmails(limit)
		return emails
	} catch (error) {
		if (error instanceof Error) {
			if (error.message.includes('invalid_grant')) {
				throw new Error(
					'Google connection expired. Please reconnect Google in Link Integration.'
				)
			}
			throw error
		}
		throw new Error(
			'Failed to fetch emails. Please ensure Google is connected in Link Integration.'
		)
	}
}

// Tool function for searching emails
async function searchEmailsTool({ query }: { query: string }) {
	// Check if Gmail is connected
	const isConnected = await checkGmailConnection()
	if (!isConnected) {
		throw new Error(
			'Google is not connected. Please connect Google in Link Integration settings.'
		)
	}

	try {
		const emails = await searchGmailEmails(query)
		return emails
	} catch (error) {
		if (error instanceof Error) {
			if (error.message.includes('invalid_grant')) {
				throw new Error(
					'Google connection expired. Please reconnect Google in Link Integration.'
				)
			}
			throw error
		}
		throw new Error(
			'Failed to search emails. Please ensure Google is connected in Link Integration.'
		)
	}
}

export const gmailTools: TamboTool[] = [
	{
		name: 'get_latest_emails',
		description:
			"Fetch the user's latest emails from their connected Gmail account. Use when user asks about recent emails, inbox, priority messages, or wants to see their latest correspondence.",
		tool: getLatestEmailsTool,
		inputSchema: z.object({
			limit: z
				.number()
				.min(1)
				.max(50)
				.default(10)
				.describe('Number of emails to retrieve (max 50)'),
		}),
		outputSchema: z.array(emailSchema),
	},
	{
		name: 'search_emails',
		description:
			"Search the user's Gmail inbox with a query. Use when user asks to find specific emails by sender, subject, keyword, or date. Supports Gmail search syntax like 'from:john@example.com', 'subject:invoice', 'is:unread', 'after:2024/01/01'.",
		tool: searchEmailsTool,
		inputSchema: z.object({
			query: z
				.string()
				.describe(
					'Gmail search query (e.g., "from:john@example.com", "subject:invoice", "is:unread after:2024/01/01")'
				),
		}),
		outputSchema: z.array(emailSchema),
	},
]
