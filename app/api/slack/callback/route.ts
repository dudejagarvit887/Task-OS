import { auth, clerkClient } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import type { OrgPublicMetadata } from '@/components/link-integration-dialog/actions'

interface SlackTokens {
	access_token: string
	team_id?: string
	team_name?: string
	scope?: string
}

interface OrgPrivateMetadata {
	slackTokens?: SlackTokens
}

interface SlackOAuthResponse {
	ok: boolean
	access_token?: string
	team?: {
		id: string
		name: string
	}
	scope?: string
	error?: string
}

/**
 * Handles Slack OAuth callback
 */
export async function GET(request: Request) {
	const { searchParams } = new URL(request.url)
	const code = searchParams.get('code')
	const state = searchParams.get('state')
	const error = searchParams.get('error')

	if (error) {
		return NextResponse.redirect(
			`${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/dashboard?slack_error=${error}`
		)
	}

	if (!code || !state) {
		return NextResponse.redirect(
			`${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/dashboard?error=missing_code`
		)
	}

	const { userId } = await auth()
	if (!userId) {
		return NextResponse.redirect(
			`${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/sign-in`
		)
	}

	const orgId = state // state contains orgId

	try {
		const clientId = process.env.SLACK_CLIENT_ID
		const clientSecret = process.env.SLACK_CLIENT_SECRET

		if (!clientId || !clientSecret) {
			throw new Error('Slack credentials not configured')
		}

		const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/api/slack/callback`

		// Exchange code for access token
		const tokenResponse = await fetch('https://slack.com/api/oauth.v2.access', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			body: new URLSearchParams({
				client_id: clientId,
				client_secret: clientSecret,
				code,
				redirect_uri: redirectUri,
			}),
		})

		const tokenData = (await tokenResponse.json()) as SlackOAuthResponse

		if (!tokenData.ok || !tokenData.access_token) {
			throw new Error(tokenData.error ?? 'Failed to get access token')
		}

		// Store tokens in organization metadata
		const client = await clerkClient()
		const org = await client.organizations.getOrganization({
			organizationId: orgId,
		})

		const currentPublicMetadata = (org.publicMetadata ??
			{}) as OrgPublicMetadata
		const currentIntegrations = currentPublicMetadata.integrations ?? {}

		// Update public metadata to mark Slack as connected
		await client.organizations.updateOrganizationMetadata(orgId, {
			publicMetadata: {
				...currentPublicMetadata,
				integrations: {
					...currentIntegrations,
					slack: {
						connected: true,
						connectedAt: new Date().toISOString(),
						connectedBy: userId,
					},
				},
			},
		})

		// Store tokens in private metadata
		const currentPrivateMetadata = (org.privateMetadata ??
			{}) as OrgPrivateMetadata

		await client.organizations.updateOrganizationMetadata(orgId, {
			privateMetadata: {
				...currentPrivateMetadata,
				slackTokens: {
					access_token: tokenData.access_token,
					team_id: tokenData.team?.id,
					team_name: tokenData.team?.name,
					scope: tokenData.scope,
				},
			},
		})

		return NextResponse.redirect(
			`${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/dashboard?slack_connected=true`
		)
	} catch (error) {
		console.error('Slack OAuth error:', error)
		return NextResponse.redirect(
			`${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/dashboard?slack_error=auth_failed`
		)
	}
}
