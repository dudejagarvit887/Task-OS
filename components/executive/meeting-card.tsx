'use client'

import {
	Calendar,
	CalendarCheck,
	Clock,
	ExternalLink,
	Users,
	Video,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface MeetingCardProps {
	title?: string
	summary?: string
	description?: string
	startTime?: string
	endTime?: string
	meetLink?: string
	htmlLink?: string
	eventId?: string
	attendees?: string[]
	status?: 'success' | 'pending' | 'error'
	message?: string
}

export function MeetingCard({
	title,
	summary,
	description,
	startTime,
	endTime,
	meetLink,
	htmlLink,
	eventId: _eventId,
	attendees,
	status = 'success',
	message,
}: MeetingCardProps) {
	const meetingTitle = summary || title || 'Meeting Created'
	const safeAttendees = attendees ?? []

	// Format datetime strings to readable format
	const formatDateTime = (dateStr?: string) => {
		if (!dateStr) return null
		try {
			const date = new Date(dateStr)
			return {
				date: date.toLocaleDateString('en-US', {
					weekday: 'short',
					month: 'short',
					day: 'numeric',
				}),
				time: date.toLocaleTimeString('en-US', {
					hour: 'numeric',
					minute: '2-digit',
					hour12: true,
				}),
			}
		} catch {
			return null
		}
	}

	const start = formatDateTime(startTime)
	const end = formatDateTime(endTime)

	return (
		<Card className='w-full max-w-2xl'>
			<CardHeader>
				<CardTitle className='flex items-center gap-2'>
					<CalendarCheck
						className={cn(
							'size-5',
							status === 'success' && 'text-green-500',
							status === 'error' && 'text-red-500'
						)}
					/>
					{meetingTitle}
				</CardTitle>
				{message && (
					<CardDescription className='flex items-center gap-1.5'>
						{status === 'success' && (
							<Badge variant='secondary' className='text-[10px]'>
								Confirmed
							</Badge>
						)}
						{message}
					</CardDescription>
				)}
			</CardHeader>

			<CardContent className='space-y-4'>
				{/* Date and Time */}
				{(start || end) && (
					<div className='flex items-start gap-3 rounded-lg border p-3'>
						<Clock className='mt-0.5 size-4 shrink-0 text-muted-foreground' />
						<div className='flex-1 space-y-1'>
							{start && (
								<div className='flex items-baseline gap-2'>
									<span className='font-semibold text-sm'>{start.time}</span>
									<span className='text-xs text-muted-foreground'>
										{start.date}
									</span>
								</div>
							)}
							{end && (
								<div className='text-xs text-muted-foreground'>
									Ends at {end.time}
								</div>
							)}
						</div>
					</div>
				)}

				{/* Description */}
				{description && (
					<div className='space-y-2'>
						<p className='text-xs font-medium text-muted-foreground'>
							Description
						</p>
						<p className='text-sm leading-relaxed'>{description}</p>
					</div>
				)}

				{/* Attendees */}
				{safeAttendees.length > 0 && (
					<div className='space-y-2'>
						<p className='flex items-center gap-1.5 text-xs font-medium text-muted-foreground'>
							<Users className='size-3.5' />
							Attendees ({safeAttendees.length})
						</p>
						<div className='flex flex-wrap gap-1.5'>
							{safeAttendees.map((attendee, index) => (
								<Badge
									key={`attendee-${index}-${attendee}`}
									variant='outline'
									className='text-xs'
								>
									{attendee}
								</Badge>
							))}
						</div>
					</div>
				)}

				{/* Links */}
				<div className='space-y-2'>
					{meetLink && (
						<Button
							variant='default'
							size='sm'
							className='w-full justify-start gap-2'
							asChild
						>
							<a href={meetLink} target='_blank' rel='noopener noreferrer'>
								<Video className='size-4' />
								Join Google Meet
								<ExternalLink className='ml-auto size-3.5' />
							</a>
						</Button>
					)}
					{htmlLink && (
						<Button
							variant='outline'
							size='sm'
							className='w-full justify-start gap-2'
							asChild
						>
							<a href={htmlLink} target='_blank' rel='noopener noreferrer'>
								<Calendar className='size-4' />
								View in Google Calendar
								<ExternalLink className='ml-auto size-3.5' />
							</a>
						</Button>
					)}
				</div>
			</CardContent>

			{status === 'success' && (
				<CardFooter className='text-xs text-muted-foreground'>
					Meeting has been added to your calendar
				</CardFooter>
			)}
		</Card>
	)
}
