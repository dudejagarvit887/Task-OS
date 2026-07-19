'use client'

import { Loader2, Mic, Square, Volume2 } from 'lucide-react'
import { useVoiceChat, type VoiceChatState } from '@/hooks/useVoiceChat'
import { cn } from '@/lib/utils'

function getButtonConfig(state: VoiceChatState) {
	switch (state) {
		case 'recording':
			return {
				icon: Square,
				iconClass: 'size-6 fill-current',
				bgClass: 'bg-red-500/90 text-white',
				outerPulseClass: 'bg-red-500/10 animate-pulse',
				innerPulseClass: 'bg-red-500/20 animate-pulse [animation-delay:150ms]',
				ariaLabel: 'Stop recording',
			}
		case 'transcribing':
			return {
				icon: Loader2,
				iconClass: 'size-8 animate-spin',
				bgClass: 'bg-primary text-primary-foreground',
				outerPulseClass: 'bg-primary/10',
				innerPulseClass: 'bg-primary/20',
				ariaLabel: 'Transcribing...',
			}
		case 'submitting':
		case 'waiting_response':
			return {
				icon: Loader2,
				iconClass: 'size-8 animate-spin',
				bgClass: 'bg-primary text-primary-foreground',
				outerPulseClass: 'bg-primary/10 animate-pulse',
				innerPulseClass: 'bg-primary/20 animate-pulse [animation-delay:150ms]',
				ariaLabel: 'Processing...',
			}
		case 'playing_audio':
			return {
				icon: Volume2,
				iconClass: 'size-8',
				bgClass: 'bg-primary text-primary-foreground',
				outerPulseClass: 'bg-primary/10 animate-pulse',
				innerPulseClass: 'bg-primary/20 animate-pulse [animation-delay:150ms]',
				ariaLabel: 'Playing response, click to stop',
			}
		default:
			return {
				icon: Mic,
				iconClass: 'size-8',
				bgClass: 'bg-primary text-primary-foreground',
				outerPulseClass: 'bg-primary/10 animate-pulse',
				innerPulseClass: 'bg-primary/20 animate-pulse [animation-delay:150ms]',
				ariaLabel: 'Start voice chat',
			}
	}
}

export function VoiceChatButton() {
	const { state, error, toggleRecording, stop } = useVoiceChat()
	const config = getButtonConfig(state)
	const Icon = config.icon

	const handleClick = () => {
		if (state === 'playing_audio') {
			stop()
		} else if (state === 'idle' || state === 'recording') {
			toggleRecording()
		}
	}

	const isClickable =
		state === 'idle' || state === 'recording' || state === 'playing_audio'

	return (
		<div className='flex flex-col items-center gap-2 mb-24'>
			<div className='relative flex items-center justify-center'>
				<div
					className={cn(
						'absolute size-28 rounded-full',
						config.outerPulseClass
					)}
				/>
				<div
					className={cn(
						'absolute size-24 rounded-full',
						config.innerPulseClass
					)}
				/>
				<button
					type='button'
					onClick={handleClick}
					disabled={!isClickable}
					className={cn(
						'relative z-10 flex size-20 items-center justify-center rounded-full shadow-lg transition-transform',
						isClickable && 'cursor-pointer hover:scale-105 active:scale-95',
						!isClickable && 'cursor-not-allowed',
						config.bgClass
					)}
					aria-label={config.ariaLabel}
				>
					<Icon className={config.iconClass} />
				</button>
			</div>
			{error && (
				<p className='max-w-xs text-center text-destructive text-sm'>{error}</p>
			)}
		</div>
	)
}
