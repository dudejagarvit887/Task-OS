import type { TamboTool } from '@tambo-ai/react'
import { z } from 'zod'
import { checkGmailConnection } from '@/components/link-integration-dialog/oauth-actions'
import {
	createCalendarEvent,
	findFreeSlots,
	getUpcomingEvents,
} from './calendar-service'

// Output schemas for calendar tools
const createMeetingOutputSchema = z.object({
	success: z.boolean(),
	message: z.string(),
	summary: z.string().nullish(),
	description: z.string().nullish(),
	eventId: z.string().nullish(),
	htmlLink: z.string().nullish(),
	meetLink: z.string().nullish(),
	startTime: z.string().nullish(),
	endTime: z.string().nullish(),
	attendees: z.array(z.string()).nullish(),
	status: z.string().nullish(),
})

const freeSlotSchema = z.object({
	start: z.string(),
	end: z.string(),
	duration: z.number(),
})

const findFreeSlotsOutputSchema = z.object({
	success: z.boolean(),
	freeSlots: z.array(freeSlotSchema),
	message: z.string(),
})

const calendarEventSchema = z.object({
	id: z.string().nullable().optional(),
	summary: z.string().nullable().optional(),
	description: z.string().nullable().optional(),
	start: z.string().nullable().optional(),
	end: z.string().nullable().optional(),
	attendees: z.array(z.string()).optional(),
	htmlLink: z.string().nullable().optional(),
	meetLink: z.string().nullable().optional(),
	location: z.string().nullable().optional(),
})

const getUpcomingEventsOutputSchema = z.object({
	success: z.boolean(),
	events: z.array(calendarEventSchema),
	message: z.string(),
})

/**
 * Tool function for creating calendar events with Google Meet
 */
async function createMeetingTool(params: {
	summary: string
	description?: string
	startDateTime?: string
	endDateTime?: string
	attendees?: string[]
	timeZone?: string
	includeGoogleMeet?: boolean
}) {
	// Check if Google Calendar is connected (uses same OAuth as Gmail)
	const isConnected = await checkGmailConnection()
	if (!isConnected) {
		throw new Error(
			'Google Calendar is not connected. Please connect Google in Link Integration settings.'
		)
	}

	try {
		const event = await createCalendarEvent(params)
		return {
			success: true,
			message: `Meeting "${event.summary}" created successfully!`,
			summary: event.summary,
			description: params.description,
			eventId: event.eventId,
			htmlLink: event.htmlLink,
			meetLink: event.meetLink,
			startTime: event.start,
			endTime: event.end,
			attendees: event.attendees,
			status: 'success' as const,
		}
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
			'Failed to create meeting. Please ensure Google Calendar is connected in Link Integration.'
		)
	}
}

/**
 * Tool function for finding free time slots
 */
async function findFreeSlotsTool(params: {
	date?: string
	duration?: number
	startHour?: string
	endHour?: string
}) {
	// Check if Google Calendar is connected
	const isConnected = await checkGmailConnection()
	if (!isConnected) {
		throw new Error(
			'Google Calendar is not connected. Please connect Google in Link Integration settings.'
		)
	}

	try {
		const slots = await findFreeSlots({
			date: params.date,
			duration: params.duration,
			between: {
				start: params.startHour,
				end: params.endHour,
			},
		})

		return {
			success: true,
			freeSlots: slots,
			message:
				slots.length > 0
					? `Found ${slots.length} available time slot(s)`
					: 'No free slots found in the specified time range',
		}
	} catch (error) {
		if (error instanceof Error) {
			if (error.message.includes('invalid_grant')) {
				throw new Error(
					'Google connection expired. Please reconnect Google in Link Integration.'
				)
			}
			throw error
		}
		throw new Error('Failed to find free slots.')
	}
}

/**
 * Tool function for getting upcoming calendar events
 */
async function getUpcomingEventsTool(params: { limit?: number }) {
	// Check if Google Calendar is connected
	const isConnected = await checkGmailConnection()
	if (!isConnected) {
		throw new Error(
			'Google Calendar is not connected. Please connect Google in Link Integration settings.'
		)
	}

	try {
		const events = await getUpcomingEvents(params.limit || 10)

		return {
			success: true,
			events,
			message:
				events.length > 0
					? `Found ${events.length} upcoming event(s)`
					: 'No upcoming events found',
		}
	} catch (error) {
		if (error instanceof Error) {
			if (error.message.includes('invalid_grant')) {
				throw new Error(
					'Google connection expired. Please reconnect Google in Link Integration.'
				)
			}
			throw error
		}
		throw new Error('Failed to fetch upcoming events.')
	}
}

/**
 * Calendar tools for Tambo AI
 */
export const calendarTools: TamboTool[] = [
	{
		name: 'create_google_meeting',
		description:
			'Creates a Google Calendar event with an automatic Google Meet link. Use this when the user wants to schedule a meeting, create an event, or set up a call. Can automatically add attendees by email and include meeting details. Perfect for scheduling meetings about specific topics found in Slack messages or emails. IMPORTANT: After successfully creating a meeting, IMMEDIATELY render a MeetingCard component with the returned meeting details (summary, description, startTime, endTime, meetLink, htmlLink, attendees, status="success", message) to show the user a visual confirmation card.',
		tool: createMeetingTool,
		inputSchema: z.object({
			summary: z
				.string()
				.describe(
					'Meeting title/summary, e.g. "Q4 Budget Blocker Discussion" or "Finance Team Sync"'
				),
			description: z
				.string()
				.optional()
				.describe(
					'Detailed description of the meeting. Include context from Slack messages, blockers, or other relevant information.'
				),
			startDateTime: z
				.string()
				.optional()
				.describe(
					'Start date and time in ISO 8601 format or natural language like "tomorrow at 2pm", "2024-02-15T14:00:00". Defaults to 1 hour from now if not specified.'
				),
			endDateTime: z
				.string()
				.optional()
				.describe(
					'End date and time. If not specified, defaults to 1 hour after start time.'
				),
			attendees: z
				.array(z.string())
				.optional()
				.describe(
					'Array of email addresses of attendees. Extract these from Slack users, email senders, or user mentions.'
				),
			timeZone: z
				.string()
				.optional()
				.describe(
					'Time zone for the meeting, e.g. "America/Los_Angeles", "America/New_York". Defaults to America/Los_Angeles.'
				),
			includeGoogleMeet: z
				.boolean()
				.optional()
				.default(true)
				.describe(
					'Whether to include a Google Meet link. Defaults to true. Set to false for in-person only meetings.'
				),
		}),
		outputSchema: createMeetingOutputSchema,
	},
	{
		name: 'find_free_time_slots',
		description:
			"Finds available time slots in the user's Google Calendar. Use this to check availability before scheduling meetings or when the user asks about free time. Returns all gaps in the calendar that are large enough for a meeting.",
		tool: findFreeSlotsTool,
		inputSchema: z.object({
			date: z
				.string()
				.optional()
				.describe(
					'Date to check for free slots in ISO format (YYYY-MM-DD) or natural language like "tomorrow", "next Monday". Defaults to today.'
				),
			duration: z
				.number()
				.optional()
				.default(60)
				.describe(
					'Minimum duration needed for the meeting in minutes. Defaults to 60 minutes.'
				),
			startHour: z
				.string()
				.optional()
				.describe(
					'Start of the time range to check, in 24-hour format like "09:00". Defaults to 9:00 AM.'
				),
			endHour: z
				.string()
				.optional()
				.describe(
					'End of the time range to check, in 24-hour format like "17:00". Defaults to 5:00 PM.'
				),
		}),
		outputSchema: findFreeSlotsOutputSchema,
	},
	{
		name: 'get_upcoming_calendar_events',
		description:
			"Retrieves the user's upcoming calendar events from Google Calendar. Use this when the user asks about their schedule, what meetings they have, or what's on their calendar. Shows meeting details including attendees, Google Meet links, and timing.",
		tool: getUpcomingEventsTool,
		inputSchema: z.object({
			limit: z
				.number()
				.optional()
				.default(10)
				.describe('Maximum number of events to return. Defaults to 10.'),
		}),
		outputSchema: getUpcomingEventsOutputSchema,
	},
]
