'use server'

import { auth, clerkClient } from '@clerk/nextjs/server'
import type { OrgPublicMetadata } from './actions'

interface GmailTokens {
	access_token: string
	refresh_token?: string
	expiry_date?: number
	token_type?: string
	scope?: string
}

interface SlackTokens {
	access_token: string
	team_id?: string
	team_name?: string
	scope?: string
}

interface OrgPrivateMetadata {
	gmailTokens?: GmailTokens // Note: These tokens also grant access to Google Calendar
	slackTokens?: SlackTokens
}

/**
 * Checks if the organization has connected Gmail and has valid OAuth tokens
 * Note: These same tokens also grant access to Google Calendar
 */
export async function checkGmailConnection(): Promise<boolean> {
	const { userId, orgId } = await auth()

	if (!userId || !orgId) {
		return false
	}

	try {
		// Check organization metadata for Gmail connection status
		const client = await clerkClient()
		const org = await client.organizations.getOrganization({
			organizationId: orgId,
		})

		const publicMetadata = (org.publicMetadata ?? {}) as OrgPublicMetadata
		const isConnectedInMetadata =
			publicMetadata.integrations?.gmail?.connected ?? false

		if (!isConnectedInMetadata) {
			return false
		}

		// Verify the organization has valid OAuth tokens
		const privateMetadata = (org.privateMetadata ?? {}) as OrgPrivateMetadata
		const tokens = privateMetadata.gmailTokens

		return !!tokens?.access_token
	} catch (err: unknown) {
		console.error('Error checking Gmail connection:', err)
		return false
	}
}

/**
 * Disconnects Gmail by removing tokens and updating metadata
 */
export async function disconnectGmail() {
	const { userId, orgId } = await auth()

	if (!userId || !orgId) {
		return { error: 'Unauthorized' }
	}

	try {
		const client = await clerkClient()

		// Get organization
		const org = await client.organizations.getOrganization({
			organizationId: orgId,
		})

		const currentPublicMetadata = (org.publicMetadata ??
			{}) as OrgPublicMetadata
		const currentIntegrations = currentPublicMetadata.integrations ?? {}

		// Update publicMetadata to mark Gmail as disconnected
		await client.organizations.updateOrganizationMetadata(orgId, {
			publicMetadata: {
				...currentPublicMetadata,
				integrations: {
					...currentIntegrations,
					gmail: { connected: false },
				},
			},
		})

		// Remove tokens from privateMetadata
		const currentPrivateMetadata = (org.privateMetadata ??
			{}) as OrgPrivateMetadata
		const { gmailTokens, ...restPrivateMetadata } = currentPrivateMetadata

		await client.organizations.updateOrganizationMetadata(orgId, {
			privateMetadata: restPrivateMetadata,
		})

		return { success: true }
	} catch (err: unknown) {
		console.error('Error disconnecting Gmail:', err)
		return {
			error: err instanceof Error ? err.message : 'Failed to disconnect Gmail',
		}
	}
}

/**Google Calendar is connected (uses same OAuth tokens as Gmail)
 * This is an alias for checkGmailConnection since they share the same OAuth flow
 */
export async function checkCalendarConnection(): Promise<boolean> {
	return checkGmailConnection()
}

/**
 * Checks if
 * Checks if the organization has connected Slack and has valid OAuth tokens
 */
export async function checkSlackConnection(): Promise<boolean> {
	const { userId, orgId } = await auth()

	if (!userId || !orgId) {
		return false
	}

	try {
		const client = await clerkClient()
		const org = await client.organizations.getOrganization({
			organizationId: orgId,
		})

		const publicMetadata = (org.publicMetadata ?? {}) as OrgPublicMetadata
		const isConnectedInMetadata =
			publicMetadata.integrations?.slack?.connected ?? false

		if (!isConnectedInMetadata) {
			return false
		}

		const privateMetadata = (org.privateMetadata ?? {}) as OrgPrivateMetadata
		const tokens = privateMetadata.slackTokens

		return !!tokens?.access_token
	} catch (err: unknown) {
		console.error('Error checking Slack connection:', err)
		return false
	}
}

/**
 * Disconnects Slack by removing tokens and updating metadata
 */
export async function disconnectSlack() {
	const { userId, orgId } = await auth()

	if (!userId || !orgId) {
		return { error: 'Unauthorized' }
	}

	try {
		const client = await clerkClient()

		const org = await client.organizations.getOrganization({
			organizationId: orgId,
		})

		const currentPublicMetadata = (org.publicMetadata ??
			{}) as OrgPublicMetadata
		const currentIntegrations = currentPublicMetadata.integrations ?? {}

		await client.organizations.updateOrganizationMetadata(orgId, {
			publicMetadata: {
				...currentPublicMetadata,
				integrations: {
					...currentIntegrations,
					slack: { connected: false },
				},
			},
		})

		const currentPrivateMetadata = (org.privateMetadata ??
			{}) as OrgPrivateMetadata
		const { slackTokens, ...restPrivateMetadata } = currentPrivateMetadata

		await client.organizations.updateOrganizationMetadata(orgId, {
			privateMetadata: restPrivateMetadata,
		})

		return { success: true }
	} catch (err: unknown) {
		console.error('Error disconnecting Slack:', err)
		return {
			error: err instanceof Error ? err.message : 'Failed to disconnect Slack',
		}
	}
}
