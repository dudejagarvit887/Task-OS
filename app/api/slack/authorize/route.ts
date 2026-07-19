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

/**
 * Initiates Slack OAuth flow
 */
export async function GET(request: Request) {
	const { userId, orgId } = await auth()

	if (!userId || !orgId) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
	}

	const clientId = process.env.SLACK_CLIENT_ID
	if (!clientId) {
		return NextResponse.json(
			{ error: 'Slack client ID not configured' },
			{ status: 500 }
		)
	}

	// Build redirect URI
	const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/api/slack/callback`

	// Slack OAuth URL with required scopes for C-level executive analytics
	const scopes = [
		'channels:history',
		'channels:read',
		'groups:history',
		'groups:read',
		'users:read',
		'team:read',
	].join(',')

	const slackAuthUrl = `https://slack.com/oauth/v2/authorize?client_id=${clientId}&scope=${scopes}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${orgId}`

	return NextResponse.redirect(slackAuthUrl)
}
