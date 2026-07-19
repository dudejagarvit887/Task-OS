'use client'

import { useUser } from '@clerk/nextjs'
import { LinkIntegrationDialog } from '@/components/link-integration-dialog'
import { NavUser } from '@/components/nav-user'
import { OrgSwitcher } from '@/components/org-switcher'
import {
	ThreadHistory,
	ThreadHistoryHeader,
	ThreadHistoryList,
	ThreadHistoryNewButton,
	ThreadHistorySearch,
	useThreadHistoryContext,
} from '@/components/tambo/thread-history'

function SidebarContent() {
	const { user } = useUser()
	const { isCollapsed } = useThreadHistoryContext()

	if (!user) return null

	const userData = {
		name: user.fullName || user.username || 'Unknown',
		email: user.primaryEmailAddress?.emailAddress || 'john@doe.com',
		avatar: user.imageUrl || '/avatars/shadcn.jpg',
	}

	return (
		<>
			<OrgSwitcher isCollapsed={isCollapsed} />
			<ThreadHistoryHeader />
			<ThreadHistoryNewButton />
			<ThreadHistorySearch />
			<LinkIntegrationDialog isCollapsed={isCollapsed} />
			<ThreadHistoryList />
			<div className='mt-auto pt-4'>
				<NavUser user={userData} isCollapsed={isCollapsed} />
			</div>
		</>
	)
}

export function AppSidebar() {
	return (
		<ThreadHistory position='left' defaultCollapsed={false}>
			<SidebarContent />
		</ThreadHistory>
	)
}
