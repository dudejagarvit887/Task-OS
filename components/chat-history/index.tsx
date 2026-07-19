'use client'

import { useTamboThread, useTamboThreadList } from '@tambo-ai/react'
import { MessageSquare } from 'lucide-react'
import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from '@/components/ui/sidebar'

export function ChatHistory() {
	const { data: threads } = useTamboThreadList()
	const { thread: currentThread, switchCurrentThread } = useTamboThread()

	const threadItems = threads?.items ?? []

	return (
		<SidebarGroup className='group-data-[collapsible=icon]:hidden'>
			<SidebarGroupLabel>YOUR CHAT</SidebarGroupLabel>
			<SidebarMenu>
				{threadItems.length === 0 && (
					<p className='px-2 py-1 text-xs text-muted-foreground'>
						No conversations yet
					</p>
				)}
				{threadItems.map((thread) => (
					<SidebarMenuItem key={thread.id}>
						<SidebarMenuButton
							isActive={currentThread?.id === thread.id}
							onClick={() => switchCurrentThread(thread.id)}
						>
							<MessageSquare className='size-4' />
							<span>
								{thread.name ??
									`Thread ${thread.id.substring(0, 8)}`}
							</span>
						</SidebarMenuButton>
					</SidebarMenuItem>
				))}
			</SidebarMenu>
		</SidebarGroup>
	)
}
