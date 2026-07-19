'use client'

import { useClerk } from '@clerk/nextjs'
import { ChevronsUpDown, LogOut } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

export function NavUser({
	user,
	isCollapsed,
}: {
	user: {
		name: string
		email: string
		avatar: string
	}
	isCollapsed?: boolean
}) {
	const { signOut } = useClerk()
	const clerk = useClerk()

	const handleSignOut = async () => {
		await signOut()
		clerk.redirectToAfterSignOut()
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<button
					type='button'
					className={cn(
						'flex w-full items-center rounded-md hover:bg-backdrop transition-colors cursor-pointer',
						isCollapsed ? 'p-1 justify-center' : 'gap-2 p-2',
					)}
				>
					<Avatar className='size-8 flex-none rounded-lg'>
						<AvatarImage src={user.avatar} alt={user.name} />
						<AvatarFallback className='rounded-lg'>
							{user.name.slice(0, 2).toUpperCase()}
						</AvatarFallback>
					</Avatar>
					<div
						className={cn(
							'grid flex-1 text-left text-sm leading-tight',
							isCollapsed
								? 'hidden'
								: 'opacity-100 transition-all duration-300 delay-100',
						)}
					>
						<span className='truncate font-medium'>{user.name}</span>
						<span className='truncate text-xs'>{user.email}</span>
					</div>
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
				align='end'
				sideOffset={4}
			>
				<DropdownMenuLabel className='p-0 font-normal'>
					<div className='flex items-center gap-2 px-1 py-1.5 text-left text-sm'>
						<Avatar className='h-8 w-8 rounded-lg'>
							<AvatarImage src={user.avatar} alt={user.name} />
							<AvatarFallback className='rounded-lg'>
								{user.name.slice(0, 2).toUpperCase()}
							</AvatarFallback>
						</Avatar>
						<div className='grid flex-1 text-left text-sm leading-tight'>
							<span className='truncate font-medium'>{user.name}</span>
							<span className='truncate text-xs'>{user.email}</span>
						</div>
					</div>
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuItem
					onClick={handleSignOut}
					className='cursor-pointer'
				>
					<LogOut className='mr-2' />
					Log out
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
