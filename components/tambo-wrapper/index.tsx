'use client'

import { ClerkProvider } from '@clerk/nextjs'
import { TamboProvider } from '@tambo-ai/react'
import { StreamingTTSPlayer } from '@/components/tambo/streaming-tts-player'
import {
	MeetingContextProvider,
	useMeetingContext,
} from '@/lib/meeting-context'
import { components, tools } from '@/lib/tambo'

function TamboInnerWrapper({
	children,
	userToken,
}: {
	children: React.ReactNode
	userToken?: string
}) {
	const { selectedSlot } = useMeetingContext()

	const contextHelpers = {
		selectedMeetingSlot: () => {
			if (!selectedSlot?.time) {
				return null
			}

			const durationPart = selectedSlot.duration
				? ` (${selectedSlot.duration})`
				: ''
			const datePart = selectedSlot.date ? ` on ${selectedSlot.date}` : ''
			const message = `User has selected a time slot: ${selectedSlot.time}${durationPart}${datePart}. Use this information when scheduling meetings or responding to scheduling requests.`

			return {
				selectedSlot: {
					time: selectedSlot.time,
					duration: selectedSlot.duration || 'unspecified',
					date: selectedSlot.date || 'unspecified',
					scheduleTitle: selectedSlot.scheduleTitle || 'schedule',
				},
				message,
			}
		},
	}

	return (
		<TamboProvider
			apiKey={process.env.NEXT_PUBLIC_TAMBO_API_KEY ?? ''}
			components={components}
			tools={tools}
			userToken={userToken}
			contextHelpers={contextHelpers}
		>
			<StreamingTTSPlayer />
			{children}
		</TamboProvider>
	)
}

export function TamboWrapper({
	children,
	userToken,
}: {
	children: React.ReactNode
	userToken?: string
}) {
	return (
		<ClerkProvider>
			<MeetingContextProvider>
				<TamboInnerWrapper userToken={userToken}>{children}</TamboInnerWrapper>
			</MeetingContextProvider>
		</ClerkProvider>
	)
}
