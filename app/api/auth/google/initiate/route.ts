import { auth } from '@clerk/nextjs/server'
import { google } from 'googleapis'
import { NextResponse } from 'next/server'

export async function GET() {
	try {
		const { userId, orgId } = await auth()

		if (!userId || !orgId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		// Create OAuth2 client
		const oauth2Client = new google.auth.OAuth2(
			process.env.GOOGLE_CLIENT_ID,
			process.env.GOOGLE_CLIENT_SECRET,
			`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/google/callback`
		)

		// Generate auth URL with Gmail and Calendar scopes
		// Note: gmail.readonly includes full email access + metadata + labels (read-only)
		// calendar scope allows full calendar read/write access
		const authUrl = oauth2Client.generateAuthUrl({
			access_type: 'offline', // Request refresh token
			prompt: 'consent', // Force consent screen to get refresh token
			scope: [
				'https://www.googleapis.com/auth/gmail.readonly', // Full read access to Gmail
				'https://www.googleapis.com/auth/calendar', // Full calendar access
			],
			state: JSON.stringify({ userId, orgId }), // Pass user/org context
		})

		return NextResponse.json({ authUrl })
	} catch (error) {
		console.error('Error initiating Google OAuth:', error)
		return NextResponse.json(
			{ error: 'Failed to initiate OAuth' },
			{ status: 500 }
		)
	}
}
