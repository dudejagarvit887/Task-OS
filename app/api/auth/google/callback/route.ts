import { clerkClient } from '@clerk/nextjs/server'
import { google } from 'googleapis'
import { NextRequest, NextResponse } from 'next/server'
import type { OrgPublicMetadata } from '@/components/link-integration-dialog/actions'

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

export async function GET(request: NextRequest) {
	try {
		const searchParams = request.nextUrl.searchParams
		const code = searchParams.get('code')
		const state = searchParams.get('state')
		const error = searchParams.get('error')

		// Handle OAuth errors
		if (error) {
			console.error('OAuth error:', error)
			return NextResponse.redirect(
				new URL('/dashboard?error=oauth_failed', request.url)
			)
		}

		if (!code || !state) {
			return NextResponse.redirect(
				new URL('/dashboard?error=missing_params', request.url)
			)
		}

		// Parse state to get user/org IDs
		const { userId, orgId } = JSON.parse(state)

		if (!userId || !orgId) {
			return NextResponse.redirect(
				new URL('/dashboard?error=invalid_state', request.url)
			)
		}

		// Create OAuth2 client
		const oauth2Client = new google.auth.OAuth2(
			process.env.GOOGLE_CLIENT_ID,
			process.env.GOOGLE_CLIENT_SECRET,
			`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/google/callback`
		)

		// Exchange code for tokens
		const { tokens } = await oauth2Client.getToken(code)

		if (!tokens.access_token) {
			throw new Error('No access token received')
		}

		// Store tokens in Clerk organization privateMetadata
		const client = await clerkClient()

		// Get current organization
		const org = await client.organizations.getOrganization({
			organizationId: orgId,
		})

		// Update privateMetadata with Gmail tokens
		await client.organizations.updateOrganizationMetadata(orgId, {
			privateMetadata: {
				...(org.privateMetadata ?? {}),
				gmailTokens: {
					access_token: tokens.access_token,
					refresh_token: tokens.refresh_token,
					expiry_date: tokens.expiry_date,
					token_type: tokens.token_type,
					scope: tokens.scope,
				} as GmailTokens,
			},
		})

		// Update publicMetadata to mark Gmail as connected
		const currentPublicMetadata = (org.publicMetadata ?? {}) as OrgPublicMetadata
		const currentIntegrations = currentPublicMetadata.integrations ?? {}

		await client.organizations.updateOrganizationMetadata(orgId, {
			publicMetadata: {
				...currentPublicMetadata,
				integrations: {
					...currentIntegrations,
					gmail: {
						connected: true,
						connectedAt: new Date().toISOString(),
						connectedBy: userId,
					},
				},
			},
		})

		// Redirect back to dashboard
		return NextResponse.redirect(new URL('/dashboard?gmail=connected', request.url))
	} catch (error) {
		console.error('Error in OAuth callback:', error)
		return NextResponse.redirect(
			new URL('/dashboard?error=token_exchange_failed', request.url)
		)
	}
}
