'use client'

import { type Suggestion, useTambo } from '@tambo-ai/react'
import dynamic from 'next/dynamic'
import { CanvasSpace } from '@/components/tambo/canvas-space'
import { MessageGenerationStage } from '@/components/tambo/message-generation-stage'
import {
	MessageInput,
	MessageInputError,
	MessageInputFileButton,
	MessageInputMcpPromptButton,
	MessageInputMcpResourceButton,
	MessageInputSubmitButton,
	MessageInputTextarea,
	MessageInputToolbar,
} from '@/components/tambo/message-input'
import {
	MessageSuggestions,
	MessageSuggestionsList,
	MessageSuggestionsStatus,
} from '@/components/tambo/message-suggestions'
import { ScrollableMessageContainer } from '@/components/tambo/scrollable-message-container'
import {
	ThreadContent,
	ThreadContentMessages,
} from '@/components/tambo/thread-content'

// Dynamically import VoiceChatButton to avoid SSR issues with Worker API
const VoiceChatButton = dynamic(
	() =>
		import('@/components/voice-chat-button').then((mod) => ({
			default: mod.VoiceChatButton,
		})),
	{ ssr: false }
)

const defaultSuggestions: Suggestion[] = [
	{
		id: 'suggestion-1',
		title: 'Get started',
		detailedSuggestion: 'What can you help me with?',
		messageId: 'welcome-query',
	},
	{
		id: 'suggestion-2',
		title: 'Company overview',
		detailedSuggestion:
			'Show me company analytics from Slack for the past week',
		messageId: 'slack-analytics-query',
	},
	{
		id: 'suggestion-3',
		title: 'Risk assessment',
		detailedSuggestion: 'What are the biggest blockers across all departments?',
		messageId: 'slack-risks-query',
	},
	{
		id: 'suggestion-4',
		title: 'Department health',
		detailedSuggestion: 'How is the Engineering team doing based on Slack?',
		messageId: 'slack-department-query',
	},
	{
		id: 'suggestion-5',
		title: 'Progress tracking',
		detailedSuggestion: 'Show me task completion metrics from Slack',
		messageId: 'slack-progress-query',
	},
	{
		id: 'suggestion-6',
		title: 'Team engagement',
		detailedSuggestion: 'How engaged is our team based on Slack activity?',
		messageId: 'slack-engagement-query',
	},
]

export default function Page() {
	const { thread } = useTambo()
	const hasMessages = (thread?.messages?.length ?? 0) > 0

	if (!hasMessages) {
		return (
			<div className='flex flex-1 flex-col items-center justify-center gap-8 p-4'>
				<VoiceChatButton />
				<div className='w-full max-w-2xl'>
					<MessageInput>
						<MessageInputTextarea placeholder='Ask anything...' />
						<MessageInputToolbar>
							<MessageInputFileButton />
							<MessageInputMcpPromptButton />
							<MessageInputMcpResourceButton />
							<MessageInputSubmitButton />
						</MessageInputToolbar>
						<MessageInputError />
					</MessageInput>
				</div>
				<MessageSuggestions initialSuggestions={defaultSuggestions}>
					<MessageSuggestionsList />
				</MessageSuggestions>
			</div>
		)
	}

	return (
		<div className='flex h-full flex-1 overflow-hidden'>
			{/* Chat panel */}
			<div className='flex w-125 min-w-100 flex-col border-r border-border'>
				<ScrollableMessageContainer className='flex-1 p-4'>
					<ThreadContent>
						<ThreadContentMessages />
					</ThreadContent>
				</ScrollableMessageContainer>
				<MessageSuggestions>
					<MessageSuggestionsStatus />
				</MessageSuggestions>
				<MessageGenerationStage className='px-4' />
				<div className='px-4 pb-4'>
					<MessageInput>
						<MessageInputTextarea placeholder='Type your message...' />
						<MessageInputToolbar>
							<MessageInputFileButton />
							<MessageInputMcpPromptButton />
							<MessageInputMcpResourceButton />
							<MessageInputSubmitButton />
						</MessageInputToolbar>
						<MessageInputError />
					</MessageInput>
				</div>
				<MessageSuggestions initialSuggestions={defaultSuggestions}>
					<MessageSuggestionsList />
				</MessageSuggestions>
			</div>

			{/* Canvas */}
			<CanvasSpace />
		</div>
	)
}
