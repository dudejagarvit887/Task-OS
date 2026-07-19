'use client'

import { useTamboComponentState, useTamboStreamStatus } from '@tambo-ai/react'
import {
	AlertTriangle,
	Calendar,
	Clock,
	MapPin,
	Monitor,
	Users,
} from 'lucide-react'
import { useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { useMeetingContext } from '@/lib/meeting-context'
import { cn } from '@/lib/utils'

interface MeetingSchedulerProps {
	title?: string
	date?: string
	meetings?: {
		time?: string
		duration?: string
		meetingTitle?: string
		attendees?: string[]
		location?: string
		type?: 'in-person' | 'virtual' | 'hybrid'
		notes?: string
		isConflict?: boolean
	}[]
	availableSlots?: {
		time?: string
		duration?: string
	}[]
}

const typeConfig = {
	'in-person': { icon: MapPin, label: 'In-person' },
	virtual: { icon: Monitor, label: 'Virtual' },
	hybrid: { icon: Users, label: 'Hybrid' },
}

export function MeetingScheduler({
	title,
	date,
	meetings,
	availableSlots,
}: MeetingSchedulerProps) {
	const [selectedMeeting, setSelectedMeeting] = useTamboComponentState<
		string | null
	>('selectedMeeting', null)
	const [selectedSlot, setSelectedSlot] = useTamboComponentState<string | null>(
		'selectedSlot',
		null
	)
	const { streamStatus } = useTamboStreamStatus()
	const isStreaming = streamStatus.isStreaming || streamStatus.isPending
	const { setSelectedSlot: setGlobalSelectedSlot } = useMeetingContext()

	const safeMeetings = meetings ?? []
	const safeSlots = availableSlots ?? []

	// Sync selected slot with global context for AI awareness
	useEffect(() => {
		if (selectedSlot && safeSlots.length > 0) {
			const slotIndex = Number.parseInt(selectedSlot.replace('slot-', ''), 10)
			const slot = safeSlots[slotIndex]
			if (slot) {
				setGlobalSelectedSlot({
					time: slot.time,
					duration: slot.duration,
					date: date,
					scheduleTitle: title,
				})
			}
		} else {
			setGlobalSelectedSlot(null)
		}
	}, [selectedSlot, safeSlots, date, title, setGlobalSelectedSlot])

	const handleSelectMeeting = (id: string) => {
		if (isStreaming) return
		setSelectedMeeting(selectedMeeting === id ? null : id)
	}

	const handleSelectSlot = (id: string) => {
		if (isStreaming) return
		setSelectedSlot(selectedSlot === id ? null : id)
	}

	return (
		<Card className='w-full max-w-2xl'>
			<CardHeader>
				<CardTitle className='flex items-center gap-2'>
					<Calendar className='size-5' />
					{title ?? 'Schedule'}
				</CardTitle>
				<CardDescription className='flex items-center gap-2'>
					<span>{date ?? 'Today'}</span>
					{safeMeetings.length > 0 && (
						<Badge variant='secondary' className='text-[10px]'>
							{safeMeetings.length} meeting
							{safeMeetings.length === 1 ? '' : 's'}
						</Badge>
					)}
					{safeSlots.length > 0 && (
						<Badge variant='outline' className='text-[10px]'>
							{safeSlots.length} available
						</Badge>
					)}
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className='space-y-2'>
					{safeMeetings.map((meeting, index) => {
						const meetingId = `meeting-${index}`
						const isExpanded = selectedMeeting === meetingId
						const meetingType = meeting?.type ?? 'virtual'
						const TypeIcon = typeConfig[meetingType]?.icon ?? Monitor

						return (
							<button
								key={meetingId}
								type='button'
								disabled={isStreaming}
								onClick={() => handleSelectMeeting(meetingId)}
								className={cn(
									'flex w-full gap-3 rounded-lg border p-3 text-left transition-colors',
									meeting?.isConflict
										? 'border-amber-500/50 bg-amber-500/5'
										: 'border-border hover:bg-accent/50',
									isExpanded && 'bg-accent/50',
									isStreaming && 'cursor-not-allowed opacity-60'
								)}
							>
								<div className='w-16 shrink-0 text-right'>
									<p className='text-sm font-semibold'>
										{meeting?.time ?? '--:--'}
									</p>
									{meeting?.duration && (
										<p className='text-xs text-muted-foreground'>
											{meeting.duration}
										</p>
									)}
								</div>
								<div className='min-w-0 flex-1'>
									<div className='flex items-center gap-2'>
										<p className='truncate text-sm font-medium'>
											{meeting?.meetingTitle ?? 'Untitled meeting'}
										</p>
										{meeting?.isConflict && (
											<AlertTriangle className='size-3.5 shrink-0 text-amber-500' />
										)}
									</div>
									<div className='mt-1 flex flex-wrap items-center gap-2'>
										<span className='flex items-center gap-1 text-xs text-muted-foreground'>
											<TypeIcon className='size-3' />
											{typeConfig[meetingType]?.label ?? meetingType}
										</span>
										{meeting?.location && (
											<span className='truncate text-xs text-muted-foreground'>
												{meeting.location}
											</span>
										)}
									</div>
									{meeting?.attendees && meeting.attendees.length > 0 && (
										<div className='mt-1.5 flex items-center gap-1'>
											<div className='flex -space-x-1.5'>
												{meeting.attendees.slice(0, 4).map((attendee) => (
													<div
														key={`${meetingId}-${attendee}`}
														className='flex size-5 items-center justify-center rounded-full border border-background bg-primary/10 text-[9px] font-medium text-primary'
													>
														{(attendee ?? '?')[0]?.toUpperCase()}
													</div>
												))}
											</div>
											{meeting.attendees.length > 4 && (
												<span className='text-xs text-muted-foreground'>
													+{meeting.attendees.length - 4}
												</span>
											)}
										</div>
									)}
									{isExpanded && meeting?.notes && (
										<p className='mt-2 border-t pt-2 text-xs text-muted-foreground'>
											{meeting.notes}
										</p>
									)}
								</div>
							</button>
						)
					})}

					{safeSlots.length > 0 && (
						<div className='pt-2'>
							<p className='mb-2 text-xs font-medium text-muted-foreground'>
								Available Slots
							</p>
							<div className='space-y-1.5'>
								{safeSlots.map((slot, index) => {
									const slotId = `slot-${index}`
									const isSelected = selectedSlot === slotId

									return (
										<button
											key={slotId}
											type='button'
											disabled={isStreaming}
											onClick={() => handleSelectSlot(slotId)}
											className={cn(
												'flex w-full items-center gap-3 rounded-lg border border-dashed p-3 text-left transition-colors',
												isSelected
													? 'border-primary bg-primary/5'
													: 'border-border hover:border-primary/50 hover:bg-accent/30',
												isStreaming && 'cursor-not-allowed opacity-60'
											)}
										>
											<div className='w-16 shrink-0 text-right'>
												<p className='text-sm font-medium'>
													{slot?.time ?? '--:--'}
												</p>
											</div>
											<div className='flex flex-1 items-center justify-between'>
												<span className='text-xs text-muted-foreground'>
													{slot?.duration
														? `${slot.duration} available`
														: 'Available'}
												</span>
												{isSelected && (
													<Badge variant='default' className='text-[10px]'>
														Selected
													</Badge>
												)}
											</div>
										</button>
									)
								})}
							</div>
						</div>
					)}

					{safeMeetings.length === 0 &&
						safeSlots.length === 0 &&
						!isStreaming && (
							<p className='py-8 text-center text-sm text-muted-foreground'>
								No meetings or available slots
							</p>
						)}
				</div>
			</CardContent>
			{selectedSlot && (
				<CardFooter>
					<p className='flex items-center gap-1 text-xs text-muted-foreground'>
						<Clock className='size-3' />
						Slot selected &mdash; ask the assistant to schedule a meeting
					</p>
				</CardFooter>
			)}
		</Card>
	)
}
