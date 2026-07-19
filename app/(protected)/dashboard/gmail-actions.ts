'use server'

import { auth } from '@clerk/nextjs/server'
import { fetchLatestEmails, searchEmails } from '@/lib/gmail-service'

/**
 * Fetches the latest emails from the organization's connected Gmail account
 * This server action is called by MCP tools
 */
export async function getLatestEmails(limit: number = 10) {
	const { userId, orgId } = await auth()

	if (!userId || !orgId) {
		throw new Error('Unauthorized')
	}

	try {
		const emails = await fetchLatestEmails(limit)
		return emails
	} catch (error) {
		console.error('Error in getLatestEmails:', error)

		if (error instanceof Error) {
			throw error
		}

		throw new Error('Failed to fetch emails from Gmail.')
	}
}

/**
 * Searches emails in the organization's connected Gmail account using Gmail query syntax
 * This server action is called by MCP tools
 */
export async function searchGmailEmails(query: string) {
	const { userId, orgId } = await auth()

	if (!userId || !orgId) {
		throw new Error('Unauthorized')
	}

	try {
		const emails = await searchEmails(query)
		return emails
	} catch (error) {
		console.error('Error in searchGmailEmails:', error)

		if (error instanceof Error) {
			throw error
		}

		throw new Error('Failed to search emails.')
	}
}
