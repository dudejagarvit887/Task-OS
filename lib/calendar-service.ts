'use server'

import { auth, clerkClient } from '@clerk/nextjs/server'
import type { calendar_v3 } from 'googleapis'
import { google } from 'googleapis'

interface CalendarTokens {
	access_token: string
	refresh_token?: string
	expiry_date?: number
	token_type?: string
	scope?: string
}

interface OrgPrivateMetadata {
	gmailTokens?: CalendarTokens // Reusing the same tokens since they share OAuth
}

/**
 * Creates an authenticated Google Calendar API client for the given organization
 */
async function getCalendarClient(orgId: string) {
	const client = await clerkClient()

	// Get organization
	const org = await client.organizations.getOrganization({
		organizationId: orgId,
	})

	const privateMetadata = (org.privateMetadata ?? {}) as OrgPrivateMetadata
	const tokens = privateMetadata.gmailTokens // Using same tokens as Gmail

	if (!tokens?.access_token) {
		throw new Error(
			'No Google OAuth token found. Please connect Google Calendar first.'
		)
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
		console.log('Refreshing Google tokens...')

		// Update stored tokens with new access token
		const updatedTokens: CalendarTokens = {
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

	// Return Calendar API client
	return google.calendar({ version: 'v3', auth: oauth2Client })
}

/**
 * Formats a date to RFC3339 format required by Google Calendar API
 */
function formatDateTimeForCalendar(dateTime: Date): string {
	if (!dateTime || Number.isNaN(dateTime.getTime())) {
		throw new Error('Invalid date provided to formatDateTimeForCalendar')
	}
	return dateTime.toISOString()
}

/**
 * Parses natural language date strings to a Date object
 */
function parseDate(dateStr?: string): Date {
	if (!dateStr) return new Date()

	const normalized = dateStr.toLowerCase().trim()
	const now = new Date()

	// Handle relative dates
	if (normalized === 'today') {
		return new Date(now)
	}

	if (normalized === 'tomorrow') {
		const tomorrow = new Date(now)
		tomorrow.setDate(tomorrow.getDate() + 1)
		return tomorrow
	}

	if (normalized === 'yesterday') {
		const yesterday = new Date(now)
		yesterday.setDate(yesterday.getDate() - 1)
		return yesterday
	}

	// Handle "next monday", "next tuesday", etc.
	const nextDayMatch = normalized.match(
		/^next\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)$/
	)
	if (nextDayMatch) {
		const targetDay = [
			'sunday',
			'monday',
			'tuesday',
			'wednesday',
			'thursday',
			'friday',
			'saturday',
		].indexOf(nextDayMatch[1])
		const currentDay = now.getDay()
		const daysUntilTarget = (targetDay + 7 - currentDay) % 7 || 7
		const result = new Date(now)
		result.setDate(result.getDate() + daysUntilTarget)
		return result
	}

	// Try parsing as ISO date or other standard formats
	try {
		const parsed = new Date(dateStr)
		if (!Number.isNaN(parsed.getTime())) {
			return parsed
		}
	} catch {
		// Fall through to default
	}

	// Default to today if parsing fails
	return new Date()
}

/**
 * Parses natural language date/time (simplified version)
 */
function parseDateTime(
	dateTimeStr?: string
): { start: Date; end: Date } | null {
	if (!dateTimeStr) return null

	try {
		// For now, handle ISO strings and basic relative dates
		// You can integrate a more sophisticated library like chrono-node if needed
		const now = new Date()

		// Handle relative times like "in 1 hour", "tomorrow at 2pm"
		if (dateTimeStr.toLowerCase().includes('tomorrow')) {
			const tomorrow = new Date(now)
			tomorrow.setDate(tomorrow.getDate() + 1)
			tomorrow.setHours(14, 0, 0, 0) // Default to 2pm
			const end = new Date(tomorrow)
			end.setHours(15, 0, 0, 0) // 1 hour meeting
			return { start: tomorrow, end }
		}

		// Try parsing as ISO date
		const parsed = new Date(dateTimeStr)
		if (!Number.isNaN(parsed.getTime())) {
			const end = new Date(parsed)
			end.setHours(parsed.getHours() + 1) // Default 1 hour duration
			return { start: parsed, end }
		}

		return null
	} catch {
		return null
	}
}

interface CreateMeetingParams {
	summary: string
	description?: string
	startDateTime?: string
	endDateTime?: string
	attendees?: string[]
	timeZone?: string
	includeGoogleMeet?: boolean
}

/**
 * Creates a Google Calendar event with optional Google Meet link
 */
export async function createCalendarEvent(params: CreateMeetingParams) {
	const { orgId } = await auth()

	if (!orgId) {
		throw new Error('No organization found')
	}

	const calendar = await getCalendarClient(orgId)

	// Parse date/time
	const now = new Date()
	let startDateTime: Date
	let endDateTime: Date

	if (params.startDateTime) {
		const parsed = parseDateTime(params.startDateTime)
		if (parsed) {
			startDateTime = parsed.start
			endDateTime = parsed.end
		} else {
			// Default to 1 hour from now
			startDateTime = new Date(now.getTime() + 60 * 60 * 1000)
			endDateTime = new Date(now.getTime() + 2 * 60 * 60 * 1000)
		}
	} else {
		// Default to 1 hour from now
		startDateTime = new Date(now.getTime() + 60 * 60 * 1000)
		endDateTime = new Date(now.getTime() + 2 * 60 * 60 * 1000)
	}

	// Override end time if provided
	if (params.endDateTime) {
		const parsedEnd = parseDateTime(params.endDateTime)
		if (parsedEnd) {
			endDateTime = parsedEnd.start
		}
	}

	// Build attendees
	const attendees: calendar_v3.Schema$EventAttendee[] = (
		params.attendees || []
	).map((email) => ({
		email,
	}))

	// Build event object
	const event: calendar_v3.Schema$Event = {
		summary: params.summary,
		description: params.description,
		start: {
			dateTime: formatDateTimeForCalendar(startDateTime),
			timeZone: params.timeZone || 'America/Los_Angeles',
		},
		end: {
			dateTime: formatDateTimeForCalendar(endDateTime),
			timeZone: params.timeZone || 'America/Los_Angeles',
		},
		attendees,
	}

	// Add Google Meet conferencing if requested
	if (params.includeGoogleMeet !== false) {
		event.conferenceData = {
			createRequest: {
				requestId: `meet-${Date.now()}`,
				conferenceSolutionKey: {
					type: 'hangoutsMeet',
				},
			},
		}
	}

	// Create the event
	const response = await calendar.events.insert({
		calendarId: 'primary',
		conferenceDataVersion: 1, // Required for Google Meet
		requestBody: event,
	})

	return {
		eventId: response.data.id,
		htmlLink: response.data.htmlLink,
		meetLink: response.data.conferenceData?.entryPoints?.find(
			(ep) => ep.entryPointType === 'video'
		)?.uri,
		summary: response.data.summary,
		start: response.data.start?.dateTime,
		end: response.data.end?.dateTime,
		attendees: response.data.attendees?.map((a) => a.email).filter(Boolean),
	}
}

interface FindFreeSlotsParams {
	date?: string
	duration?: number // in minutes
	between?: {
		start?: string // e.g., "9:00"
		end?: string // e.g., "17:00"
	}
}

/**
 * Finds free time slots in the user's calendar
 */
export async function findFreeSlots(params: FindFreeSlotsParams = {}) {
	const { orgId } = await auth()

	if (!orgId) {
		throw new Error('No organization found')
	}

	const calendar = await getCalendarClient(orgId)

	// Determine the date range to check
	const targetDate = parseDate(params.date)

	// Validate the parsed date
	if (Number.isNaN(targetDate.getTime())) {
		throw new Error(`Invalid date: ${params.date}`)
	}

	const startOfDay = new Date(targetDate)
	startOfDay.setHours(9, 0, 0, 0) // 9 AM
	const endOfDay = new Date(targetDate)
	endOfDay.setHours(17, 0, 0, 0) // 5 PM

	// Override with custom hours if provided
	if (params.between?.start) {
		const [hours, minutes] = params.between.start.split(':')
		const parsedHours = Number.parseInt(hours, 10)
		const parsedMinutes = Number.parseInt(minutes || '0', 10)

		if (Number.isNaN(parsedHours) || Number.isNaN(parsedMinutes)) {
			throw new Error(`Invalid start time format: ${params.between.start}`)
		}

		startOfDay.setHours(parsedHours, parsedMinutes, 0, 0)
	}
	if (params.between?.end) {
		const [hours, minutes] = params.between.end.split(':')
		const parsedHours = Number.parseInt(hours, 10)
		const parsedMinutes = Number.parseInt(minutes || '0', 10)

		if (Number.isNaN(parsedHours) || Number.isNaN(parsedMinutes)) {
			throw new Error(`Invalid end time format: ${params.between.end}`)
		}

		endOfDay.setHours(parsedHours, parsedMinutes, 0, 0)
	}

	// Final validation before API call
	if (Number.isNaN(startOfDay.getTime()) || Number.isNaN(endOfDay.getTime())) {
		throw new Error('Invalid date range calculated')
	}

	// Get events for the day
	const response = await calendar.events.list({
		calendarId: 'primary',
		timeMin: formatDateTimeForCalendar(startOfDay),
		timeMax: formatDateTimeForCalendar(endOfDay),
		singleEvents: true,
		orderBy: 'startTime',
	})

	const events = response.data.items || []
	const duration = params.duration || 60 // Default 60 minutes

	// Find gaps between events
	const freeSlots: { start: string; end: string; duration: number }[] = []
	let currentTime = startOfDay

	for (const event of events) {
		if (!event.start?.dateTime || !event.end?.dateTime) continue

		const eventStart = new Date(event.start.dateTime)
		const eventEnd = new Date(event.end.dateTime)

		// Check if there's a gap before this event
		const gapMinutes = (eventStart.getTime() - currentTime.getTime()) / 60000

		if (gapMinutes >= duration) {
			freeSlots.push({
				start: currentTime.toISOString(),
				end: eventStart.toISOString(),
				duration: Math.floor(gapMinutes),
			})
		}

		// Move currentTime to end of this event
		if (eventEnd > currentTime) {
			currentTime = eventEnd
		}
	}

	// Check if there's time left at the end of the day
	const remainingMinutes = (endOfDay.getTime() - currentTime.getTime()) / 60000
	if (remainingMinutes >= duration) {
		freeSlots.push({
			start: currentTime.toISOString(),
			end: endOfDay.toISOString(),
			duration: Math.floor(remainingMinutes),
		})
	}

	return freeSlots
}

/**
 * Gets upcoming calendar events
 */
export async function getUpcomingEvents(limit = 10) {
	const { orgId } = await auth()

	if (!orgId) {
		throw new Error('No organization found')
	}

	const calendar = await getCalendarClient(orgId)

	const now = new Date()
	const response = await calendar.events.list({
		calendarId: 'primary',
		timeMin: formatDateTimeForCalendar(now),
		maxResults: limit,
		singleEvents: true,
		orderBy: 'startTime',
	})

	const events = response.data.items || []

	return events.map((event) => ({
		id: event.id,
		summary: event.summary,
		description: event.description,
		start: event.start?.dateTime || event.start?.date,
		end: event.end?.dateTime || event.end?.date,
		attendees: event.attendees?.map((a) => a.email).filter(Boolean),
		htmlLink: event.htmlLink,
		meetLink: event.conferenceData?.entryPoints?.find(
			(ep) => ep.entryPointType === 'video'
		)?.uri,
		location: event.location,
	}))
}
