'use client'

import { AlertTriangle, CheckCircle2, TrendingUp, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export interface DepartmentInsight {
	department?: string
	channels?: string[]
	totalMessages?: number
	activeMembers?: number
	tasksMentioned?: number
	blockersMentioned?: number
	progressIndicators?: number
	sentiment?: 'positive' | 'neutral' | 'negative' | 'mixed'
	riskLevel?: 'low' | 'medium' | 'high'
	keyHighlights?: string[]
	blockerDetails?: string[]
}

export interface RiskItem {
	risk?: string
	severity?: 'low' | 'medium' | 'high'
	source?: string
	details?: string[]
}

export interface SlackAnalyticsProps {
	title?: string
	period?: string
	totalMessages?: number
	totalChannels?: number
	activeUsers?: number
	overallSentiment?: 'positive' | 'neutral' | 'negative' | 'mixed'
	departmentInsights?: DepartmentInsight[]
	topRisks?: RiskItem[]
	progressMetrics?: {
		completedTasks?: number
		inProgressTasks?: number
		blockedTasks?: number
		overdueItems?: number
	}
	trends?: {
		communicationTrend?: 'increasing' | 'stable' | 'decreasing'
		engagementLevel?: 'high' | 'medium' | 'low'
		collaborationScore?: number
	}
}

const sentimentColors = {
	positive: 'bg-green-500/10 text-green-700 border-green-500/20',
	neutral: 'bg-gray-500/10 text-gray-700 border-gray-500/20',
	negative: 'bg-red-500/10 text-red-700 border-red-500/20',
	mixed: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20',
}

const riskColors = {
	low: 'bg-green-500/10 text-green-700 border-green-500/20',
	medium: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20',
	high: 'bg-red-500/10 text-red-700 border-red-500/20',
}

export function SlackAnalytics({
	title = 'Company Slack Analytics',
	period = 'Last 7 days',
	totalMessages = 0,
	totalChannels = 0,
	activeUsers = 0,
	overallSentiment = 'neutral',
	departmentInsights = [],
	topRisks = [],
	progressMetrics,
	trends,
}: SlackAnalyticsProps) {
	return (
		<div className='space-y-3 w-full max-h-[80vh] overflow-y-auto pr-2'>
			{/* Compact Header */}
			<div className='flex items-center justify-between pb-2 border-b'>
				<div>
					<h2 className='text-lg font-bold'>{title}</h2>
					<p className='text-xs text-muted-foreground'>{period}</p>
				</div>
				<Badge className={sentimentColors[overallSentiment]} variant='outline'>
					{overallSentiment}
				</Badge>
			</div>

			{/* Compact Overview Metrics - Single Row */}
			<div className='grid grid-cols-3 gap-2'>
				<div className='p-2 border rounded-md space-y-1'>
					<div className='flex items-center justify-between'>
						<p className='text-xs text-muted-foreground'>Messages</p>
						<TrendingUp className='h-3 w-3 text-muted-foreground' />
					</div>
					<p className='text-xl font-bold'>{totalMessages.toLocaleString()}</p>
					<p className='text-[10px] text-muted-foreground'>
						{totalChannels} channels
					</p>
				</div>

				<div className='p-2 border rounded-md space-y-1'>
					<div className='flex items-center justify-between'>
						<p className='text-xs text-muted-foreground'>Users</p>
						<Users className='h-3 w-3 text-muted-foreground' />
					</div>
					<p className='text-xl font-bold'>{activeUsers}</p>
					<p className='text-[10px] text-muted-foreground'>
						{trends?.engagementLevel ?? 'medium'}
					</p>
				</div>

				<div className='p-2 border rounded-md space-y-1'>
					<div className='flex items-center justify-between'>
						<p className='text-xs text-muted-foreground'>Score</p>
						<CheckCircle2 className='h-3 w-3 text-muted-foreground' />
					</div>
					<p className='text-xl font-bold'>{trends?.collaborationScore ?? 0}</p>
					<p className='text-[10px] text-muted-foreground'>
						{trends?.communicationTrend === 'increasing' && '↑ trend'}
						{trends?.communicationTrend === 'decreasing' && '↓ trend'}
						{trends?.communicationTrend === 'stable' && '→ stable'}
					</p>
				</div>
			</div>

			{/* Compact Progress Metrics */}
			{progressMetrics && (
				<div className='p-2 border rounded-md'>
					<p className='text-xs font-medium mb-2'>Task Progress</p>
					<div className='grid grid-cols-4 gap-2'>
						<div className='text-center'>
							<p className='text-lg font-bold text-green-600'>
								{progressMetrics.completedTasks ?? 0}
							</p>
							<p className='text-[10px] text-muted-foreground'>Done</p>
						</div>
						<div className='text-center'>
							<p className='text-lg font-bold text-blue-600'>
								{progressMetrics.inProgressTasks ?? 0}
							</p>
							<p className='text-[10px] text-muted-foreground'>Active</p>
						</div>
						<div className='text-center'>
							<p className='text-lg font-bold text-red-600'>
								{progressMetrics.blockedTasks ?? 0}
							</p>
							<p className='text-[10px] text-muted-foreground'>Blocked</p>
						</div>
						<div className='text-center'>
							<p className='text-lg font-bold text-orange-600'>
								{progressMetrics.overdueItems ?? 0}
							</p>
							<p className='text-[10px] text-muted-foreground'>Overdue</p>
						</div>
					</div>
				</div>
			)}

			{/* Enhanced Top Risks with Details */}
			{topRisks && topRisks.length > 0 && (
				<div className='border rounded-md p-2'>
					<div className='flex items-center gap-2 mb-2'>
						<AlertTriangle className='h-4 w-4 text-orange-500' />
						<p className='text-xs font-semibold'>Top Risks & Blockers</p>
					</div>
					<div className='space-y-2'>
						{topRisks.map((risk) => (
							<div
								key={`${risk.risk}-${risk.source}`}
								className='p-2 border rounded text-xs space-y-1'
							>
								<div className='flex items-start justify-between gap-2'>
									<div className='flex-1 min-w-0'>
										<p className='font-medium text-xs truncate'>
											{risk.risk ?? 'Unknown risk'}
										</p>
										<p className='text-[10px] text-muted-foreground truncate'>
											{risk.source ?? 'Unknown'}
										</p>
									</div>
									<Badge
										className={`${riskColors[risk.severity ?? 'low']} text-[10px] px-1.5 py-0 h-5 shrink-0`}
										variant='outline'
									>
										{risk.severity ?? 'low'}
									</Badge>
								</div>
								{risk.details && risk.details.length > 0 && (
									<div className='mt-1.5 pl-2 border-l-2 border-muted space-y-1'>
										{risk.details.map((detail) => (
											<p
												key={detail.slice(0, 30)}
												className='text-[10px] text-muted-foreground leading-snug'
											>
												• {detail}
											</p>
										))}
									</div>
								)}
							</div>
						))}
					</div>
				</div>
			)}

			{/* Compact Department Insights */}
			<div>
				<p className='text-xs font-semibold mb-2'>Department Insights</p>
				<div className='space-y-2'>
					{departmentInsights.map((dept) => (
						<div
							key={`${dept.department}-${dept.channels?.join('')}`}
							className='border rounded-md p-2'
						>
							<div className='flex items-start justify-between mb-2'>
								<div className='flex-1 min-w-0'>
									<p className='text-sm font-semibold truncate'>
										{dept.department ?? 'Unknown'}
									</p>
									<p className='text-[10px] text-muted-foreground truncate'>
										{dept.channels?.join(', ') ?? 'No channels'}
									</p>
								</div>
								<div className='flex gap-1 shrink-0'>
									<Badge
										className={`${sentimentColors[dept.sentiment ?? 'neutral']} text-[10px] px-1.5 py-0 h-5`}
										variant='outline'
									>
										{dept.sentiment ?? 'neutral'}
									</Badge>
									<Badge
										className={`${riskColors[dept.riskLevel ?? 'low']} text-[10px] px-1.5 py-0 h-5`}
										variant='outline'
									>
										{dept.riskLevel ?? 'low'}
									</Badge>
								</div>
							</div>

							{/* Compact Metrics Grid */}
							<div className='grid grid-cols-4 gap-1.5 mb-2'>
								<div className='text-center p-1.5 bg-muted/30 rounded'>
									<p className='text-sm font-semibold'>
										{dept.totalMessages ?? 0}
									</p>
									<p className='text-[9px] text-muted-foreground'>msgs</p>
								</div>
								<div className='text-center p-1.5 bg-muted/30 rounded'>
									<p className='text-sm font-semibold'>
										{dept.activeMembers ?? 0}
									</p>
									<p className='text-[9px] text-muted-foreground'>users</p>
								</div>
								<div className='text-center p-1.5 bg-blue-500/10 rounded'>
									<p className='text-sm font-semibold text-blue-600'>
										{dept.tasksMentioned ?? 0}
									</p>
									<p className='text-[9px] text-muted-foreground'>tasks</p>
								</div>
								<div className='text-center p-1.5 bg-red-500/10 rounded'>
									<p className='text-sm font-semibold text-red-600'>
										{dept.blockersMentioned ?? 0}
									</p>
									<p className='text-[9px] text-muted-foreground'>block</p>
								</div>
							</div>

							{/* Progress Indicator */}
							{(dept.progressIndicators ?? 0) > 0 && (
								<div className='flex items-center gap-1.5 text-[10px] text-green-600 mb-1.5 px-1'>
									<CheckCircle2 className='h-3 w-3' />
									<span>{dept.progressIndicators} progress signals</span>
								</div>
							)}

							{/* Blocker Details */}
							{dept.blockerDetails && dept.blockerDetails.length > 0 && (
								<div className='mb-1.5 p-1.5 bg-red-500/5 border-l-2 border-red-500 rounded-r'>
									<p className='text-[10px] font-medium text-red-900 dark:text-red-100 mb-1'>
										🚫 Blockers:
									</p>
									<div className='space-y-0.5'>
										{dept.blockerDetails.map((blocker) => (
											<p
												key={blocker.slice(0, 30)}
												className='text-[10px] text-muted-foreground leading-snug pl-2'
											>
												• {blocker}
											</p>
										))}
									</div>
								</div>
							)}

							{/* Key Highlights */}
							{dept.keyHighlights && dept.keyHighlights.length > 0 && (
								<div className='space-y-0.5'>
									{dept.keyHighlights.map((highlight) => (
										<div
											key={highlight.slice(0, 30)}
											className='flex items-start gap-1.5 text-[10px]'
										>
											<span className='text-muted-foreground shrink-0'>•</span>
											<span className='text-muted-foreground leading-snug'>
												{highlight}
											</span>
										</div>
									))}
								</div>
							)}
						</div>
					))}
				</div>
			</div>
		</div>
	)
}
