import type { TamboComponent, TamboTool } from '@tambo-ai/react'
import { z } from 'zod'
import { EmailViewer } from '@/components/executive/email-viewer'
import { MeetingCard } from '@/components/executive/meeting-card'
import { MeetingScheduler } from '@/components/executive/meeting-scheduler'
import { SlackAnalytics } from '@/components/executive/slack-analytics'
import { TodoList } from '@/components/executive/todo-list'
import { calendarTools } from './calendar-tools'
import { gmailTools } from './gmail-tools'
import { slackTools } from './slack-tools'

export const components: TamboComponent[] = [
	{
		name: 'TodoList',
		description:
			'A task management component for C-level executives. Displays prioritized action items with categories, due dates, and completion tracking. Use when the user asks about tasks, to-dos, action items, or priorities.',
		component: TodoList,
		propsSchema: z.object({
			title: z
				.string()
				.nullish()
				.describe('Title for the todo list, e.g. "Q1 Strategic Priorities"'),
			items: z
				.array(
					z.object({
						text: z.string().nullish().describe('The todo item description'),
						priority: z
							.string()
							.nullish()
							.describe('Priority level (e.g., "high", "medium", "low")'),
						dueDate: z
							.string()
							.nullish()
							.describe('Due date in human-readable format'),
						category: z
							.string()
							.nullish()
							.describe('Category like "Finance", "Operations", "HR"'),
					})
				)
				.nullish()
				.describe('Array of todo items for the executive'),
		}),
	},
	{
		name: 'MeetingCard',
		description:
			'Displays details of a newly created meeting with links to join and view in calendar. Shows meeting title, description, time, attendees, Google Meet link, and calendar link. Use this IMMEDIATELY after creating a meeting with create_google_meeting tool to show the user a visual confirmation card with all meeting details and action links.',
		component: MeetingCard,
		propsSchema: z.object({
			title: z
				.string()
				.nullish()
				.describe('Optional override title for the card'),
			summary: z
				.string()
				.nullish()
				.describe('Meeting title/summary from the created event'),
			description: z
				.string()
				.nullish()
				.describe('Meeting description with context and agenda'),
			startTime: z.string().nullish().describe('Start time in ISO 8601 format'),
			endTime: z.string().nullish().describe('End time in ISO 8601 format'),
			meetLink: z
				.string()
				.nullish()
				.describe('Google Meet video conference link'),
			htmlLink: z.string().nullish().describe('Google Calendar event link'),
			eventId: z.string().nullish().describe('Google Calendar event ID'),
			attendees: z
				.array(z.string())
				.nullish()
				.describe('Array of attendee email addresses'),
			status: z
				.string()
				.nullish()
				.describe(
					'Status of the meeting creation (e.g., "success", "pending", "error")'
				),
			message: z
				.string()
				.nullish()
				.describe('Success or error message to display'),
		}),
	},
	{
		name: 'EmailViewer',
		description:
			'An email inbox viewer for executives showing priority emails with urgency flags, categories, and preview text. Use when the user asks about emails, inbox, or messages from their Gmail or email integration.',
		component: EmailViewer,
		propsSchema: z.object({
			title: z
				.string()
				.nullish()
				.describe('Header for the email viewer, e.g. "Priority Inbox"'),
			emails: z
				.array(
					z.object({
						sender: z.string().nullish().describe('Display name of the sender'),
						senderEmail: z
							.string()
							.nullish()
							.describe('Email address of the sender'),
						subject: z.string().nullish().describe('Email subject line'),
						preview: z
							.string()
							.nullish()
							.describe('First 1-2 lines of the email body'),
						receivedAt: z
							.string()
							.nullish()
							.describe('When the email was received, human-readable'),
						isUrgent: z
							.boolean()
							.nullish()
							.describe('Whether this email is flagged as urgent'),
						category: z
							.string()
							.nullish()
							.describe('Category like "Finance", "Legal", "Board"'),
						hasAttachments: z
							.boolean()
							.nullish()
							.describe('Whether the email has attachments'),
					})
				)
				.nullish()
				.describe('Array of top priority emails for the executive to review'),
		}),
	},
	{
		name: 'MeetingScheduler',
		description:
			'A daily schedule viewer and meeting scheduler for executives. Shows meetings timeline with attendees, locations, conflict detection, and available time slots. Use when the user asks about their schedule, meetings, calendar, or wants to book time.',
		component: MeetingScheduler,
		propsSchema: z.object({
			title: z
				.string()
				.nullish()
				.describe('Header text, e.g. "Today\'s Schedule"'),
			date: z
				.string()
				.nullish()
				.describe('The date being displayed, human-readable'),
			meetings: z
				.array(
					z.object({
						time: z
							.string()
							.nullish()
							.describe('Start time of the meeting, e.g. "9:00 AM"'),
						duration: z
							.string()
							.nullish()
							.describe('Duration, e.g. "30 min" or "1 hour"'),
						meetingTitle: z.string().nullish().describe('Title of the meeting'),
						attendees: z
							.array(z.string())
							.nullish()
							.describe('List of attendee names'),
						location: z
							.string()
							.nullish()
							.describe('Meeting location or video link'),
						type: z
							.string()
							.nullish()
							.describe(
								'Meeting format (e.g., "in-person", "virtual", "hybrid")'
							),
						notes: z.string().nullish().describe('Brief notes or agenda items'),
						isConflict: z
							.boolean()
							.nullish()
							.describe('Whether this meeting conflicts with another'),
					})
				)
				.nullish()
				.describe('Array of scheduled meetings'),
			availableSlots: z
				.array(
					z.object({
						time: z.string().nullish().describe('Available time slot start'),
						duration: z.string().nullish().describe('Available duration'),
					})
				)
				.nullish()
				.describe('Array of available time slots for scheduling'),
		}),
	},
	{
		name: 'SlackAnalytics',
		description:
			'Comprehensive Slack analytics dashboard for C-level executives. Shows company-wide communication insights, department performance, risk assessment, progress metrics, and collaboration trends. Use when executives ask about company status, department health, Slack analytics, team communication, progress tracking, or risk overview.',
		component: SlackAnalytics,
		propsSchema: z.object({
			title: z
				.string()
				.nullish()
				.describe('Dashboard title, e.g. "Company Slack Analytics"'),
			period: z
				.string()
				.nullish()
				.describe('Time period being analyzed, e.g. "Last 7 days"'),
			totalMessages: z
				.number()
				.nullish()
				.describe('Total number of messages across all channels'),
			totalChannels: z
				.number()
				.nullish()
				.describe('Total number of active channels analyzed'),
			activeUsers: z
				.number()
				.nullish()
				.describe('Number of active users participating'),
			overallSentiment: z
				.string()
				.nullish()
				.describe(
					'Overall sentiment across company communications (e.g., "positive", "neutral", "negative", "mixed")'
				),
			departmentInsights: z
				.array(
					z.object({
						department: z
							.string()
							.nullish()
							.describe('Department name, e.g. "Engineering", "Sales"'),
						channels: z
							.array(z.string())
							.nullish()
							.describe('List of channel names for this department'),
						totalMessages: z
							.number()
							.nullish()
							.describe('Number of messages in department channels'),
						activeMembers: z
							.number()
							.nullish()
							.describe('Number of active team members'),
						tasksMentioned: z
							.number()
							.nullish()
							.describe('Number of tasks or action items mentioned'),
						blockersMentioned: z
							.number()
							.nullish()
							.describe('Number of blockers or urgent issues'),
						progressIndicators: z
							.number()
							.nullish()
							.describe('Number of completed or progress indicators'),
						sentiment: z
							.string()
							.nullish()
							.describe(
								'Department sentiment (e.g., "positive", "neutral", "negative", "mixed")'
							),
						riskLevel: z
							.string()
							.nullish()
							.describe(
								'Risk level for this department (e.g., "low", "medium", "high")'
							),
						keyHighlights: z
							.array(z.string())
							.nullish()
							.describe('Key highlights or notable points'),
						blockerDetails: z
							.array(z.string())
							.nullish()
							.describe('Specific blocker messages or details'),
					})
				)
				.nullish()
				.describe('Insights for each department'),
			topRisks: z
				.array(
					z.object({
						risk: z
							.string()
							.nullish()
							.describe('Description of the risk or blocker'),
						severity: z
							.string()
							.nullish()
							.describe('Severity level (e.g., "low", "medium", "high")'),
						source: z
							.string()
							.nullish()
							.describe('Source channel or department'),
						details: z
							.array(z.string())
							.nullish()
							.describe('Detailed blocker messages'),
					})
				)
				.nullish()
				.describe('Top risks and blockers across company'),
			progressMetrics: z
				.object({
					completedTasks: z
						.number()
						.nullish()
						.describe('Number of completed tasks'),
					inProgressTasks: z
						.number()
						.nullish()
						.describe('Number of in-progress tasks'),
					blockedTasks: z
						.number()
						.nullish()
						.describe('Number of blocked tasks'),
					overdueItems: z
						.number()
						.nullish()
						.describe('Number of overdue items'),
				})
				.nullish()
				.describe('Task progress metrics'),
			trends: z
				.object({
					communicationTrend: z
						.string()
						.nullish()
						.describe(
							'Communication volume trend (e.g., "increasing", "stable", "decreasing")'
						),
					engagementLevel: z
						.string()
						.nullish()
						.describe(
							'Overall engagement level (e.g., "high", "medium", "low")'
						),
					collaborationScore: z
						.number()
						.nullish()
						.describe('Collaboration score (0-100)'),
				})
				.nullish()
				.describe('Communication and collaboration trends'),
		}),
	},
]

export const tools: TamboTool[] = [
	...gmailTools,
	...slackTools,
	...calendarTools,
	// Future: Add tools for other integrations (Linear, GitHub, etc.)
]
