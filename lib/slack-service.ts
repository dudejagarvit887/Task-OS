'use server'

import { auth, clerkClient } from '@clerk/nextjs/server'
import { WebClient } from '@slack/web-api'

interface SlackTokens {
	access_token: string
	team_id?: string
	team_name?: string
	scope?: string
}

interface OrgPrivateMetadata {
	slackTokens?: SlackTokens
}

interface SlackMessage {
	userId: string
	userName: string
	text: string
	timestamp: string
	channel: string
	channelName: string
	reactions?: Array<{ name: string; count: number }>
	hasThread: boolean
	threadCount?: number
}

interface ChannelActivity {
	channelId: string
	channelName: string
	messageCount: number
	activeUsers: number
	topContributors: Array<{ name: string; messageCount: number }>
	sentiment: 'positive' | 'neutral' | 'negative' | 'mixed'
	keyTopics: string[]
	urgentCount: number
}

interface DepartmentInsight {
	department: string
	channels: string[]
	totalMessages: number
	activeMembers: number
	tasksMentioned: number
	blockersMentioned: number
	progressIndicators: number
	sentiment: 'positive' | 'neutral' | 'negative' | 'mixed'
	riskLevel: 'low' | 'medium' | 'high'
	keyHighlights: string[]
	blockerDetails?: string[]
}

interface CompanyAnalytics {
	totalMessages: number
	totalChannels: number
	activeUsers: number
	overallSentiment: 'positive' | 'neutral' | 'negative' | 'mixed'
	departmentInsights: DepartmentInsight[]
	topRisks: Array<{
		risk: string
		severity: 'low' | 'medium' | 'high'
		source: string
	}>
	progressMetrics: {
		completedTasks: number
		inProgressTasks: number
		blockedTasks: number
		overdueItems: number
	}
	trends: {
		communicationTrend: 'increasing' | 'stable' | 'decreasing'
		engagementLevel: 'high' | 'medium' | 'low'
		collaborationScore: number // 0-100
	}
}

/**
 * Gets Slack OAuth tokens from organization metadata
 */
async function getSlackTokens(): Promise<SlackTokens | null> {
	const { userId, orgId } = await auth()

	if (!userId || !orgId) {
		return null
	}

	try {
		const client = await clerkClient()
		const org = await client.organizations.getOrganization({
			organizationId: orgId,
		})

		const privateMetadata = (org.privateMetadata ?? {}) as OrgPrivateMetadata
		return privateMetadata.slackTokens ?? null
	} catch (error) {
		console.error('Error getting Slack tokens:', error)
		return null
	}
}

/**
 * Creates an authenticated Slack client
 */
async function getSlackClient(): Promise<WebClient | null> {
	const tokens = await getSlackTokens()
	if (!tokens?.access_token) {
		return null
	}

	return new WebClient(tokens.access_token)
}

/**
 * Fetches messages from multiple Slack channels for a given time period
 */
export async function getSlackMessages(
	channelIds: string[] | 'all',
	daysBack = 7
): Promise<SlackMessage[]> {
	const client = await getSlackClient()
	if (!client) {
		throw new Error('Slack not connected')
	}

	try {
		// Get all channels if 'all' is specified
		let targetChannels = channelIds
		if (channelIds === 'all') {
			const channelsResponse = await client.conversations.list({
				types: 'public_channel,private_channel',
				exclude_archived: true,
			})
			// Only include channels the bot is a member of
			targetChannels =
				channelsResponse.channels
					?.filter((c) => c.is_member === true)
					?.map((c) => c.id as string) ?? []
		}

		// Calculate timestamp for X days ago
		const oldestTimestamp = (
			Date.now() / 1000 -
			daysBack * 24 * 60 * 60
		).toString()

		// Fetch messages from all channels
		const messages: SlackMessage[] = []
		const skippedChannels: string[] = []

		for (const channelId of targetChannels) {
			try {
				const history = await client.conversations.history({
					channel: channelId,
					oldest: oldestTimestamp,
					limit: 100,
				})

				// Get channel info
				const channelInfo = await client.conversations.info({
					channel: channelId,
				})
				const channelName = channelInfo.channel?.name ?? 'unknown'

				// Process messages
				for (const msg of history.messages ?? []) {
					if (msg.subtype) continue // Skip system messages

					// Get user info
					let userName = 'Unknown User'
					if (msg.user) {
						try {
							const userInfo = await client.users.info({ user: msg.user })
							userName =
								userInfo.user?.real_name ??
								userInfo.user?.name ??
								'Unknown User'
						} catch {
							// User info fetch failed, use default
						}
					}

					messages.push({
						userId: msg.user ?? 'unknown',
						userName,
						text: msg.text ?? '',
						timestamp: msg.ts ?? '',
						channel: channelId,
						channelName,
						reactions: msg.reactions?.map((r) => ({
							name: r.name ?? '',
							count: r.count ?? 0,
						})),
						hasThread: (msg.reply_count ?? 0) > 0,
						threadCount: msg.reply_count,
					})
				}
			} catch (error: any) {
				// Check if it's a "not_in_channel" error
				if (
					error?.data?.error === 'not_in_channel' ||
					error?.message?.includes('not_in_channel')
				) {
					skippedChannels.push(channelId)
					console.warn(
						`Skipping channel ${channelId}: Bot is not a member. Add the bot to this channel to include it in analytics.`
					)
				} else {
					console.error(
						`Error fetching messages from channel ${channelId}:`,
						error
					)
				}
				// Continue with other channels
			}
		}

		if (skippedChannels.length > 0) {
			console.info(
				`Skipped ${skippedChannels.length} channel(s) because the bot is not a member. To analyze these channels, add your Slack app to them by typing /invite @YourAppName in each channel.`
			)
		}

		return messages
	} catch (error) {
		console.error('Error fetching Slack messages:', error)
		throw error
	}
}

/**
 * Analyzes messages to extract sentiment and key topics
 */
function analyzeMessages(messages: SlackMessage[]): {
	sentiment: 'positive' | 'neutral' | 'negative' | 'mixed'
	keyTopics: string[]
	urgentCount: number
	tasksMentioned: number
	blockersMentioned: number
	progressIndicators: number
} {
	const urgentKeywords = [
		'urgent',
		'asap',
		'emergency',
		'critical',
		'blocker',
		'blocked',
	]
	const taskKeywords = [
		'todo',
		'task',
		'action item',
		'need to',
		'should',
		'must',
		'deadline',
	]
	const blockerKeywords = [
		'blocked',
		'blocker',
		'stuck',
		'issue',
		'problem',
		'help needed',
	]
	const progressKeywords = [
		'completed',
		'done',
		'finished',
		'shipped',
		'launched',
		'deployed',
		'merged',
	]
	const positiveKeywords = [
		'great',
		'awesome',
		'excellent',
		'success',
		'congrats',
		'well done',
		'love',
	]
	const negativeKeywords = [
		'problem',
		'issue',
		'bug',
		'error',
		'failed',
		'blocked',
		'concern',
		'worried',
	]

	let urgentCount = 0
	let tasksMentioned = 0
	let blockersMentioned = 0
	let progressIndicators = 0
	let positiveCount = 0
	let negativeCount = 0

	// Extract topics (simple word frequency)
	const topicWords: Record<string, number> = {}

	for (const msg of messages) {
		const text = msg.text.toLowerCase()

		// Count urgent messages
		if (urgentKeywords.some((kw) => text.includes(kw))) {
			urgentCount++
		}

		// Count tasks
		if (taskKeywords.some((kw) => text.includes(kw))) {
			tasksMentioned++
		}

		// Count blockers
		if (blockerKeywords.some((kw) => text.includes(kw))) {
			blockersMentioned++
		}

		// Count progress indicators
		if (progressKeywords.some((kw) => text.includes(kw))) {
			progressIndicators++
		}

		// Sentiment analysis
		if (positiveKeywords.some((kw) => text.includes(kw))) {
			positiveCount++
		}
		if (negativeKeywords.some((kw) => text.includes(kw))) {
			negativeCount++
		}

		// Extract potential topics (words 4+ chars, mentioned 3+ times)
		const words = text.match(/\b[a-z]{4,}\b/g) ?? []
		for (const word of words) {
			if (
				![
					'that',
					'this',
					'there',
					'they',
					'them',
					'with',
					'from',
					'have',
					'been',
					'were',
				].includes(word)
			) {
				topicWords[word] = (topicWords[word] ?? 0) + 1
			}
		}
	}

	// Determine overall sentiment
	let sentiment: 'positive' | 'neutral' | 'negative' | 'mixed' = 'neutral'
	if (positiveCount > negativeCount * 1.5) {
		sentiment = 'positive'
	} else if (negativeCount > positiveCount * 1.5) {
		sentiment = 'negative'
	} else if (positiveCount > 0 || negativeCount > 0) {
		sentiment = 'mixed'
	}

	// Get top topics
	const keyTopics = Object.entries(topicWords)
		.filter(([_, count]) => count >= 3)
		.sort((a, b) => b[1] - a[1])
		.slice(0, 5)
		.map(([word]) => word)

	return {
		sentiment,
		keyTopics,
		urgentCount,
		tasksMentioned,
		blockersMentioned,
		progressIndicators,
	}
}

/**
 * Gets activity metrics for specific channels
 */
export async function getChannelActivity(
	channelIds: string[] | 'all',
	daysBack = 7
): Promise<ChannelActivity[]> {
	const messages = await getSlackMessages(channelIds, daysBack)

	// Group messages by channel
	const channelGroups = new Map<string, SlackMessage[]>()
	for (const msg of messages) {
		if (!channelGroups.has(msg.channel)) {
			channelGroups.set(msg.channel, [])
		}
		channelGroups.get(msg.channel)?.push(msg)
	}

	// Analyze each channel
	const activities: ChannelActivity[] = []
	for (const [channelId, channelMessages] of channelGroups) {
		const uniqueUsers = new Set(channelMessages.map((m) => m.userId))
		const userMessageCounts = new Map<string, number>()

		for (const msg of channelMessages) {
			userMessageCounts.set(
				msg.userName,
				(userMessageCounts.get(msg.userName) ?? 0) + 1
			)
		}

		const topContributors = Array.from(userMessageCounts.entries())
			.sort((a, b) => b[1] - a[1])
			.slice(0, 5)
			.map(([name, count]) => ({ name, messageCount: count }))

		const analysis = analyzeMessages(channelMessages)

		activities.push({
			channelId,
			channelName: channelMessages[0]?.channelName ?? 'unknown',
			messageCount: channelMessages.length,
			activeUsers: uniqueUsers.size,
			topContributors,
			sentiment: analysis.sentiment,
			keyTopics: analysis.keyTopics,
			urgentCount: analysis.urgentCount,
		})
	}

	return activities
}

/**
 * Maps channels to departments based on channel names
 */
function mapChannelsToDepartments(
	channelActivities: ChannelActivity[],
	messages: SlackMessage[]
): DepartmentInsight[] {
	const departmentMap = new Map<string, ChannelActivity[]>()

	// Department keywords mapping
	const deptKeywords: Record<string, string[]> = {
		Engineering: [
			'eng',
			'dev',
			'tech',
			'backend',
			'frontend',
			'mobile',
			'infra',
			'platform',
		],
		Product: ['product', 'pm', 'design', 'ux', 'ui'],
		Sales: ['sales', 'revenue', 'deals', 'customers'],
		Marketing: ['marketing', 'social', 'content', 'growth', 'seo'],
		Operations: ['ops', 'operations', 'logistics'],
		'Customer Success': ['support', 'customer', 'success', 'cs', 'help'],
		Finance: ['finance', 'accounting', 'budget'],
		HR: ['hr', 'people', 'recruiting', 'hiring', 'talent'],
		Legal: ['legal', 'compliance', 'contracts'],
	}

	// Classify channels
	for (const activity of channelActivities) {
		const channelName = activity.channelName.toLowerCase()
		let assigned = false

		for (const [dept, keywords] of Object.entries(deptKeywords)) {
			if (keywords.some((kw) => channelName.includes(kw))) {
				if (!departmentMap.has(dept)) {
					departmentMap.set(dept, [])
				}
				departmentMap.get(dept)?.push(activity)
				assigned = true
				break
			}
		}

		// If not assigned, put in "General" department
		if (!assigned) {
			if (!departmentMap.has('General')) {
				departmentMap.set('General', [])
			}
			departmentMap.get('General')?.push(activity)
		}
	}

	// Create department insights
	const insights: DepartmentInsight[] = []
	for (const [dept, activities] of departmentMap) {
		const totalMessages = activities.reduce((sum, a) => sum + a.messageCount, 0)
		const activeMembers = new Set(
			activities.flatMap((a) => a.topContributors.map((c) => c.name))
		).size

		// Aggregate analytics
		const tasksMentioned = activities.reduce(
			(sum, a) =>
				sum +
				a.keyTopics.filter((t) => ['task', 'todo', 'deadline'].includes(t))
					.length *
					3,
			0
		)
		const blockersMentioned = activities.reduce(
			(sum, a) => sum + a.urgentCount,
			0
		)
		// Extract blocker details from messages
		const blockerDetails: string[] = []
		for (const activity of activities) {
			const channelMsgs = messages.filter(
				(m) => m.channel === activity.channelId
			)
			for (const msg of channelMsgs) {
				const text = msg.text.toLowerCase()
				if (
					[
						'blocked',
						'blocker',
						'stuck',
						'issue',
						'problem',
						'urgent',
						'critical',
					].some((kw) => text.includes(kw))
				) {
					const summary =
						msg.text.length > 80 ? msg.text.slice(0, 80) + '...' : msg.text
					blockerDetails.push(summary)
					if (blockerDetails.length >= 3) break
				}
			}
			if (blockerDetails.length >= 3) break
		}

		const progressCount = activities.reduce(
			(sum, a) =>
				sum +
				a.keyTopics.filter((t) => ['done', 'complete', 'finished'].includes(t))
					.length *
					2,
			0
		)

		// Determine overall sentiment
		const sentimentCounts = {
			positive: activities.filter((a) => a.sentiment === 'positive').length,
			negative: activities.filter((a) => a.sentiment === 'negative').length,
			mixed: activities.filter((a) => a.sentiment === 'mixed').length,
			neutral: activities.filter((a) => a.sentiment === 'neutral').length,
		}
		let overallSentiment: 'positive' | 'neutral' | 'negative' | 'mixed' =
			'neutral'
		const maxSentiment = Math.max(...Object.values(sentimentCounts))
		if (sentimentCounts.positive === maxSentiment) overallSentiment = 'positive'
		else if (sentimentCounts.negative === maxSentiment)
			overallSentiment = 'negative'
		else if (sentimentCounts.mixed === maxSentiment) overallSentiment = 'mixed'

		// Determine risk level
		let riskLevel: 'low' | 'medium' | 'high' = 'low'
		const riskScore = blockersMentioned * 3 + sentimentCounts.negative * 2
		if (riskScore > 15) riskLevel = 'high'
		else if (riskScore > 8) riskLevel = 'medium'

		// Generate key highlights
		const keyHighlights: string[] = []
		if (progressCount > totalMessages * 0.1) {
			keyHighlights.push(`Strong progress signals (${progressCount} mentions)`)
		}
		if (blockersMentioned > 0) {
			keyHighlights.push(
				`${blockersMentioned} blockers/urgent items identified`
			)
		}
		if (totalMessages > 100) {
			keyHighlights.push('High communication volume')
		}
		if (activeMembers > 10) {
			keyHighlights.push(`${activeMembers} active team members`)
		}

		insights.push({
			department: dept,
			channels: activities.map((a) => a.channelName),
			totalMessages,
			activeMembers,
			tasksMentioned,
			blockersMentioned,
			progressIndicators: progressCount,
			sentiment: overallSentiment,
			riskLevel,
			keyHighlights,
			blockerDetails: blockerDetails.length > 0 ? blockerDetails : undefined,
		})
	}

	return insights.sort((a, b) => b.totalMessages - a.totalMessages)
}

/**
 * Generates comprehensive company analytics from Slack activity
 */
export async function getCompanyAnalytics(
	daysBack = 7
): Promise<CompanyAnalytics> {
	const messages = await getSlackMessages('all', daysBack)
	const channelActivities = await getChannelActivity('all', daysBack)
	const departmentInsights = mapChannelsToDepartments(
		channelActivities,
		messages
	)

	const totalMessages = channelActivities.reduce(
		(sum, a) => sum + a.messageCount,
		0
	)
	const activeUsers = new Set(
		channelActivities.flatMap((a) => a.topContributors.map((c) => c.name))
	).size

	// Overall sentiment
	const sentimentCounts = {
		positive: channelActivities.filter((a) => a.sentiment === 'positive')
			.length,
		negative: channelActivities.filter((a) => a.sentiment === 'negative')
			.length,
		mixed: channelActivities.filter((a) => a.sentiment === 'mixed').length,
		neutral: channelActivities.filter((a) => a.sentiment === 'neutral').length,
	}
	let overallSentiment: 'positive' | 'neutral' | 'negative' | 'mixed' =
		'neutral'
	const maxSentiment = Math.max(...Object.values(sentimentCounts))
	if (sentimentCounts.positive === maxSentiment) overallSentiment = 'positive'
	else if (sentimentCounts.negative === maxSentiment)
		overallSentiment = 'negative'
	else if (sentimentCounts.mixed === maxSentiment) overallSentiment = 'mixed'

	// Top risks - with detailed blocker information
	const topRisks: Array<{
		risk: string
		severity: 'low' | 'medium' | 'high'
		source: string
		details?: string[]
	}> = []

	for (const dept of departmentInsights) {
		if (dept.riskLevel === 'high' || dept.blockersMentioned > 0) {
			const blockerText = dept.blockersMentioned === 1 ? 'blocker' : 'blockers'
			topRisks.push({
				risk: `${dept.department}: ${dept.blockersMentioned} ${blockerText} identified`,
				severity: dept.riskLevel,
				source: dept.channels.join(', '),
				details: dept.blockerDetails,
			})
			if (topRisks.length >= 5) break
		}
	}

	// Progress metrics (estimated from message analysis)
	const completedTasks = departmentInsights.reduce(
		(sum, d) => sum + d.progressIndicators,
		0
	)
	const inProgressTasks = departmentInsights.reduce(
		(sum, d) => sum + d.tasksMentioned,
		0
	)
	const blockedTasks = departmentInsights.reduce(
		(sum, d) => sum + d.blockersMentioned,
		0
	)
	const overdueItems = Math.floor(blockedTasks * 0.6) // Estimate

	// Trends
	const communicationTrend: 'increasing' | 'stable' | 'decreasing' =
		totalMessages > daysBack * 50
			? 'increasing'
			: totalMessages > daysBack * 20
				? 'stable'
				: 'decreasing'
	const engagementLevel: 'high' | 'medium' | 'low' =
		activeUsers > 20 ? 'high' : activeUsers > 10 ? 'medium' : 'low'
	const collaborationScore = Math.min(
		100,
		Math.round((activeUsers * 5 + totalMessages / 10) / 2)
	)

	return {
		totalMessages,
		totalChannels: channelActivities.length,
		activeUsers,
		overallSentiment,
		departmentInsights,
		topRisks,
		progressMetrics: {
			completedTasks,
			inProgressTasks,
			blockedTasks,
			overdueItems,
		},
		trends: {
			communicationTrend,
			engagementLevel,
			collaborationScore,
		},
	}
}
