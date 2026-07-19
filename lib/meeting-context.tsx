'use client'

import {
	createContext,
	type ReactNode,
	useContext,
	useMemo,
	useState,
} from 'react'

interface SelectedSlot {
	time?: string
	duration?: string
	date?: string
	scheduleTitle?: string
}

interface MeetingContextValue {
	selectedSlot: SelectedSlot | null
	setSelectedSlot: (slot: SelectedSlot | null) => void
}

const MeetingContext = createContext<MeetingContextValue | undefined>(undefined)

export function MeetingContextProvider({ children }: { children: ReactNode }) {
	const [selectedSlot, setSelectedSlot] = useState<SelectedSlot | null>(null)

	const value = useMemo(
		() => ({ selectedSlot, setSelectedSlot }),
		[selectedSlot]
	)

	return (
		<MeetingContext.Provider value={value}>{children}</MeetingContext.Provider>
	)
}

export function useMeetingContext() {
	const context = useContext(MeetingContext)
	if (context === undefined) {
		throw new Error(
			'useMeetingContext must be used within a MeetingContextProvider'
		)
	}
	return context
}
