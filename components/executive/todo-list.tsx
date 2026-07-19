'use client'

import { useTamboComponentState, useTamboStreamStatus } from '@tambo-ai/react'
import {
	Calendar,
	CheckSquare,
	Circle,
	Square,
	Tag,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface TodoListProps {
	title?: string
	items?: {
		text?: string
		priority?: 'high' | 'medium' | 'low'
		dueDate?: string
		category?: string
	}[]
}

const priorityConfig = {
	high: { variant: 'destructive' as const, label: 'High' },
	medium: { variant: 'default' as const, label: 'Medium' },
	low: { variant: 'secondary' as const, label: 'Low' },
}

export function TodoList({ title, items }: TodoListProps) {
	const [completedItems, setCompletedItems] =
		useTamboComponentState<Record<string, boolean>>('completedItems', {})
	const { streamStatus } = useTamboStreamStatus()
	const isStreaming = streamStatus.isStreaming || streamStatus.isPending

	const safeItems = items ?? []
	const completedCount = Object.values(completedItems ?? {}).filter(
		Boolean
	).length

	const toggleItem = (id: string) => {
		if (isStreaming) return
		setCompletedItems({
			...completedItems,
			[id]: !(completedItems?.[id] ?? false),
		})
	}

	return (
		<Card className='w-full max-w-2xl'>
			<CardHeader>
				<CardTitle className='flex items-center gap-2'>
					<CheckSquare className='size-5' />
					{title ?? 'Action Items'}
				</CardTitle>
				<CardDescription>
					{safeItems.length > 0
						? `${completedCount} of ${safeItems.length} completed`
						: 'No items yet'}
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className='space-y-2'>
					{safeItems.map((item, index) => {
						const itemId = `todo-${index}`
						const isCompleted = completedItems?.[itemId] ?? false
						const priority = item?.priority ?? 'medium'
						const config = priorityConfig[priority]

						return (
							<button
								key={itemId}
								type='button'
								disabled={isStreaming}
								onClick={() => toggleItem(itemId)}
								className={cn(
									'flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors',
									isCompleted
										? 'border-muted bg-muted/50'
										: 'border-border hover:bg-accent/50',
									isStreaming && 'cursor-not-allowed opacity-60'
								)}
							>
								<div className='mt-0.5 shrink-0'>
									{isCompleted ? (
										<CheckSquare className='size-4 text-primary' />
									) : (
										<Square className='size-4 text-muted-foreground' />
									)}
								</div>
								<div className='min-w-0 flex-1'>
									<p
										className={cn(
											'text-sm font-medium',
											isCompleted &&
												'text-muted-foreground line-through'
										)}
									>
										{item?.text ?? 'Untitled item'}
									</p>
									<div className='mt-1.5 flex flex-wrap items-center gap-1.5'>
										<Badge variant={config.variant} className='text-[10px]'>
											{config.label}
										</Badge>
										{item?.dueDate && (
											<span className='flex items-center gap-1 text-xs text-muted-foreground'>
												<Calendar className='size-3' />
												{item.dueDate}
											</span>
										)}
										{item?.category && (
											<span className='flex items-center gap-1 text-xs text-muted-foreground'>
												<Tag className='size-3' />
												{item.category}
											</span>
										)}
									</div>
								</div>
								{!isCompleted && priority === 'high' && (
									<Circle className='mt-0.5 size-2 shrink-0 fill-destructive text-destructive' />
								)}
							</button>
						)
					})}
					{safeItems.length === 0 && !isStreaming && (
						<p className='py-8 text-center text-sm text-muted-foreground'>
							No action items yet
						</p>
					)}
				</div>
			</CardContent>
		</Card>
	)
}
