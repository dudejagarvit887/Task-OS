'use client'

import { useTamboComponentState, useTamboStreamStatus } from '@tambo-ai/react'
import {
	ArrowLeft,
	Clock,
	Mail,
	Paperclip,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface EmailViewerProps {
	title?: string
	emails?: {
		sender?: string
		senderEmail?: string
		subject?: string
		preview?: string
		receivedAt?: string
		isUrgent?: boolean
		category?: string
		hasAttachments?: boolean
	}[]
}

export function EmailViewer({ title, emails }: EmailViewerProps) {
	const [selectedEmailId, setSelectedEmailId] =
		useTamboComponentState<string | null>('selectedEmailId', null)
	const { streamStatus } = useTamboStreamStatus()
	const isStreaming = streamStatus.isStreaming || streamStatus.isPending

	const safeEmails = emails ?? []
	const urgentCount = safeEmails.filter((e) => e?.isUrgent).length
	const selectedEmail =
		selectedEmailId != null
			? safeEmails[Number.parseInt(selectedEmailId.replace('email-', ''), 10)]
			: null

	const handleSelect = (id: string) => {
		if (isStreaming) return
		setSelectedEmailId(id)
	}

	const handleBack = () => {
		setSelectedEmailId(null)
	}

	return (
		<Card className='w-full max-w-2xl flex flex-col max-h-[600px]'>
			<CardHeader className='shrink-0'>
				<CardTitle className='flex items-center gap-2'>
					<Mail className='size-5' />
					{title ?? 'Priority Inbox'}
				</CardTitle>
				<CardDescription>
					{safeEmails.length > 0
						? `${urgentCount > 0 ? `${urgentCount} urgent, ` : ''}${safeEmails.length} emails`
						: 'No emails'}
				</CardDescription>
			</CardHeader>
			<CardContent className='overflow-hidden flex-1 flex flex-col'>
				{selectedEmail ? (
					<div className='flex flex-col gap-4 overflow-y-auto'>
						<Button
							variant='ghost'
							size='sm'
							onClick={handleBack}
							className='gap-1 px-2 shrink-0'
						>
							<ArrowLeft className='size-4' />
							Back
						</Button>
						<div className='space-y-3 rounded-lg border p-4'>
							<div className='flex items-start justify-between gap-2'>
								<div className='min-w-0 flex-1'>
									<p className='font-semibold'>
										{selectedEmail?.subject ?? 'No subject'}
									</p>
									<p className='text-sm text-muted-foreground'>
										From: {selectedEmail?.sender ?? 'Unknown'}{' '}
										{selectedEmail?.senderEmail && (
											<span className='text-xs'>
												&lt;{selectedEmail.senderEmail}&gt;
											</span>
										)}
									</p>
								</div>
								<div className='flex shrink-0 items-center gap-2'>
									{selectedEmail?.isUrgent && (
										<Badge variant='destructive'>Urgent</Badge>
									)}
									{selectedEmail?.category && (
										<Badge variant='outline'>
											{selectedEmail.category}
										</Badge>
									)}
								</div>
							</div>
							{selectedEmail?.receivedAt && (
								<p className='flex items-center gap-1 text-xs text-muted-foreground'>
									<Clock className='size-3' />
									{selectedEmail.receivedAt}
								</p>
							)}
							{selectedEmail?.hasAttachments && (
								<p className='flex items-center gap-1 text-xs text-muted-foreground'>
									<Paperclip className='size-3' />
									Has attachments
								</p>
							)}
							<div className='border-t pt-3'>
								<p className='whitespace-pre-wrap text-sm leading-relaxed'>
									{selectedEmail?.preview ?? 'No content available'}
								</p>
							</div>
						</div>
					</div>
				) : (
					<div className='space-y-1 overflow-y-auto'>
						{safeEmails.map((email, index) => {
							const emailId = `email-${index}`
							const initial = (email?.sender ?? '?')[0]?.toUpperCase()

							return (
								<button
									key={emailId}
									type='button'
									disabled={isStreaming}
									onClick={() => handleSelect(emailId)}
									className={cn(
										'flex w-full items-start gap-3 rounded-lg p-3 text-left transition-colors hover:bg-accent/50',
										email?.isUrgent && 'border-l-2 border-l-destructive',
										isStreaming && 'cursor-not-allowed opacity-60'
									)}
								>
									<div
										className={cn(
											'flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold',
											email?.isUrgent
												? 'bg-destructive/10 text-destructive'
												: 'bg-primary/10 text-primary'
										)}
									>
										{initial}
									</div>
									<div className='min-w-0 flex-1'>
										<div className='flex items-center justify-between gap-2'>
											<p
												className={cn(
													'truncate text-sm',
													email?.isUrgent
														? 'font-semibold'
														: 'font-medium'
												)}
											>
												{email?.sender ?? 'Unknown'}
											</p>
											<span className='shrink-0 text-xs text-muted-foreground'>
												{email?.receivedAt ?? ''}
											</span>
										</div>
										<p className='truncate text-sm'>
											{email?.subject ?? 'No subject'}
										</p>
										<p className='truncate text-xs text-muted-foreground'>
											{email?.preview ?? ''}
										</p>
									</div>
									<div className='flex shrink-0 flex-col items-end gap-1'>
										{email?.isUrgent && (
											<Badge
												variant='destructive'
												className='text-[10px]'
											>
												Urgent
											</Badge>
										)}
										{email?.hasAttachments && (
											<Paperclip className='size-3.5 text-muted-foreground' />
										)}
									</div>
								</button>
							)
						})}
						{safeEmails.length === 0 && !isStreaming && (
							<p className='py-8 text-center text-sm text-muted-foreground'>
								No emails to display
							</p>
						)}
					</div>
				)}
			</CardContent>
		</Card>
	)
}
