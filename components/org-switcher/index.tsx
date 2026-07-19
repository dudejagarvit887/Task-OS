'use client'

import { useOrganization, useOrganizationList } from '@clerk/nextjs'
import { Building2, Check, ChevronsUpDown } from 'lucide-react'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

export function OrgSwitcher({ isCollapsed }: { isCollapsed?: boolean }) {
	const { organization } = useOrganization()
	const { userMemberships, setActive } = useOrganizationList({
		userMemberships: { infinite: true },
	})

	const handleOrgSwitch = async (orgId: string) => {
		if (!setActive) return
		await setActive({ organization: orgId })
	}

	return (
		<div className='mb-4'>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<button
						type='button'
						className={cn(
							'flex w-full items-center rounded-md hover:bg-backdrop transition-colors cursor-pointer',
							isCollapsed ? 'p-1 justify-center' : 'gap-2 p-2',
						)}
					>
						<div className='flex size-8 flex-none items-center justify-center rounded-lg bg-primary text-primary-foreground'>
							<Building2 className='size-4' />
						</div>
						<span
							className={cn(
								'text-sm font-semibold truncate',
								isCollapsed
									? 'hidden'
									: 'opacity-100 transition-all duration-300 delay-100',
							)}
						>
							{organization?.name || 'Select workspace'}
						</span>
						<ChevronsUpDown
							className={cn(
								'ml-auto size-4 flex-none',
								isCollapsed && 'hidden',
							)}
						/>
					</button>
				</DropdownMenuTrigger>
				<DropdownMenuContent
					className='min-w-56 rounded-lg'
					side='right'
					align='start'
					sideOffset={4}
				>
					<DropdownMenuLabel className='text-xs text-muted-foreground'>
						Workspaces
					</DropdownMenuLabel>
					{userMemberships?.data?.map((membership) => (
						<DropdownMenuItem
							key={membership.organization.id}
							onClick={() => handleOrgSwitch(membership.organization.id)}
							className='cursor-pointer gap-2 p-2'
						>
							<div className='flex size-6 items-center justify-center rounded-sm border'>
								<Building2 className='size-4 shrink-0' />
							</div>
							<span className='truncate'>
								{membership.organization.name}
							</span>
							{organization?.id === membership.organization.id && (
								<Check className='ml-auto size-4' />
							)}
						</DropdownMenuItem>
					))}
					<DropdownMenuSeparator />
					<DropdownMenuItem className='cursor-pointer gap-2 p-2'>
						<div className='flex size-6 items-center justify-center rounded-md border bg-background'>
							<Building2 className='size-4' />
						</div>
						<span className='text-muted-foreground'>Create workspace</span>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	)
}
