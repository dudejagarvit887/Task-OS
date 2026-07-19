import type { TamboTool } from '@tambo-ai/react'
import { z } from 'zod'
import { checkSlackConnection } from '@/components/link-integration-dialog/oauth-actions'
import {
	getChannelActivity,
	getCompanyAnalytics,
	getSlackMessages,
} from './slack-service'

// Channel activity schema
const channelActivitySchema = z.object({
	channelId: z.string(),
	channelName: z.string(),
	messageCount: z.number(),
	activeUsers: z.number(),
	topContributors: z.array(
		z.object({
			name: z.string(),
			messageCount: z.number(),
		})
	),
	sentiment: z.enum(['positive', 'neutral', 'negative', 'mixed']),
	keyTopics: z.array(z.string()),
	urgentCount: z.number(),
})

// Department insight schema
const departmentInsightSchema = z.object({
	department: z.string(),
	channels: z.array(z.string()),
	totalMessages: z.number(),
	activeMembers: z.number(),
	tasksMentioned: z.number(),
	blockersMentioned: z.number(),
	progressIndicators: z.number(),
	sentiment: z.enum(['positive', 'neutral', 'negative', 'mixed']),
	riskLevel: z.enum(['low', 'medium', 'high']),
	keyHighlights: z.array(z.string()),
	blockerDetails: z.array(z.string()).optional(),
})

// Company analytics schema
const companyAnalyticsSchema = z.object({
	totalMessages: z.number(),
	totalChannels: z.number(),
	activeUsers: z.number(),
	overallSentiment: z.enum(['positive', 'neutral', 'negative', 'mixed']),
	departmentInsights: z.array(departmentInsightSchema),
	topRisks: z.array(
		z.object({
			risk: z.string(),
			severity: z.enum(['low', 'medium', 'high']),
			source: z.string(),
			details: z.array(z.string()).optional(),
		})
	),
	progressMetrics: z.object({
		completedTasks: z.number(),
		inProgressTasks: z.number(),
		blockedTasks: z.number(),
		overdueItems: z.number(),
	}),
	trends: z.object({
		communicationTrend: z.enum(['increasing', 'stable', 'decreasing']),
		engagementLevel: z.enum(['high', 'medium', 'low']),
		collaborationScore: z.number(),
	}),
})

// Slack message schema
const slackMessageSchema = z.object({
	userId: z.string(),
	userName: z.string(),
	text: z.string(),
	timestamp: z.string(),
	channel: z.string(),
	channelName: z.string(),
	reactions: z
		.array(
			z.object({
				name: z.string(),
				count: z.number(),
			})
		)
		.optional(),
	hasThread: z.boolean(),
	threadCount: z.number().optional(),
})

/**
 * Tool function for getting Slack channel activity
 */
async function getChannelActivityTool({
	channelIds,
	daysBack,
}: {
	channelIds: string | string[]
	daysBack: number
}) {
	const isConnected = await checkSlackConnection()
	if (!isConnected) {
		throw new Error(
			'Slack is not connected. Please connect Slack in Link Integration settings.'
		)
	}

	try {
		// Parse channelIds - handle "all" string or array
		const channels =
			channelIds === 'all' || channelIds === '*'
				? 'all'
				: Array.isArray(channelIds)
					? channelIds
					: [channelIds]

		const activity = await getChannelActivity(channels, daysBack)
		return activity
	} catch (error) {
		if (error instanceof Error) {
			if (
				error.message.includes('not_authed') ||
				error.message.includes('invalid_auth')
			) {
				throw new Error(
					'Slack connection expired. Please reconnect Slack in Link Integration.'
				)
			}
			throw error
		}
		throw new Error(
			'Failed to fetch Slack activity. Please ensure Slack is connected in Link Integration.'
		)
	}
}

/**
 * Tool function for getting company analytics from Slack
 */
async function getCompanyAnalyticsTool({ daysBack }: { daysBack: number }) {
	const isConnected = await checkSlackConnection()
	if (!isConnected) {
		throw new Error(
			'Slack is not connected. Please connect Slack in Link Integration settings.'
		)
	}

	try {
		const analytics = await getCompanyAnalytics(daysBack)
		return analytics
	} catch (error) {
		if (error instanceof Error) {
			if (
				error.message.includes('not_authed') ||
				error.message.includes('invalid_auth')
			) {
				throw new Error(
					'Slack connection expired. Please reconnect Slack in Link Integration.'
				)
			}
			throw error
		}
		throw new Error(
			'Failed to fetch company analytics. Please ensure Slack is connected in Link Integration.'
		)
	}
}

/**
 * Tool function for searching Slack messages
 */
async function getSlackMessagesTool({
	channelIds,
	daysBack,
}: {
	channelIds: string | string[]
	daysBack: number
}) {
	const isConnected = await checkSlackConnection()
	if (!isConnected) {
		throw new Error(
			'Slack is not connected. Please connect Slack in Link Integration settings.'
		)
	}

	try {
		const channels =
			channelIds === 'all' || channelIds === '*'
				? 'all'
				: Array.isArray(channelIds)
					? channelIds
					: [channelIds]

		const messages = await getSlackMessages(channels, daysBack)
		return messages
	} catch (error) {
		if (error instanceof Error) {
			if (
				error.message.includes('not_authed') ||
				error.message.includes('invalid_auth')
			) {
				throw new Error(
					'Slack connection expired. Please reconnect Slack in Link Integration.'
				)
			}
			throw error
		}
		throw new Error(
			'Failed to fetch Slack messages. Please ensure Slack is connected in Link Integration.'
		)
	}
}

export const slackTools: TamboTool[] = [
	{
		name: 'get_slack_channel_activity',
		description:
			'Get activity metrics from Slack channels including message counts, active users, sentiment analysis, and key topics. Use when executives ask about department communication, channel activity, team engagement, or Slack metrics. Can analyze specific channels or all channels.',
		tool: getChannelActivityTool,
		inputSchema: z.object({
			channelIds: z
				.union([z.string(), z.array(z.string())])
				.describe(
					'Channel IDs to analyze, or "all" for all channels. Examples: "C1234567890", ["C123", "C456"], or "all"'
				),
			daysBack: z
				.number()
				.min(1)
				.max(30)
				.default(7)
				.describe('Number of days to look back (1-30 days)'),
		}),
		outputSchema: z.array(channelActivitySchema),
	},
	{
		name: 'get_company_slack_analytics',
		description:
			'Get comprehensive company-wide analytics from all Slack channels, including department insights, risk assessment, progress metrics, and trends. Use when C-level executives ask for company overview, department status, progress tracking, risk analysis, or overall company health from Slack communications.',
		tool: getCompanyAnalyticsTool,
		inputSchema: z.object({
			daysBack: z
				.number()
				.min(1)
				.max(30)
				.default(7)
				.describe('Number of days to analyze (1-30 days)'),
		}),
		outputSchema: companyAnalyticsSchema,
	},
	{
		name: 'get_slack_messages',
		description:
			'Retrieve raw Slack messages from specific channels or all channels within a time period. Use when executives need to see actual message content, conversation details, or specific discussions from channels.',
		tool: getSlackMessagesTool,
		inputSchema: z.object({
			channelIds: z
				.union([z.string(), z.array(z.string())])
				.describe(
					'Channel IDs to fetch messages from, or "all" for all channels'
				),
			daysBack: z
				.number()
				.min(1)
				.max(30)
				.default(7)
				.describe('Number of days to look back (1-30 days)'),
		}),
		outputSchema: z.array(slackMessageSchema),
	},
]
