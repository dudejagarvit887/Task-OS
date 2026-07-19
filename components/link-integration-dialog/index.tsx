'use client'

import { useOrganization } from '@clerk/nextjs'
import { Link2, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import {
	type IntegrationName,
	type OrgPublicMetadata,
	toggleIntegration,
} from './actions'
import { disconnectGmail, disconnectSlack } from './oauth-actions'

const integrations: {
	name: string
	key: IntegrationName
	description: string
	provider: string
	iconPath: string
	iconColor: string
}[] = [
	{
		name: 'Google',
		key: 'gmail',
		description:
			'Connect Gmail and Google Calendar to manage emails and schedule meetings with Google Meet.',
		provider: 'Google',
		iconPath: '/assets/gmail-svgrepo-com.svg',
		iconColor: '#EA4335',
	},
	{
		name: 'Slack',
		key: 'slack',
		description:
			'Sync team messaging and get notifications for important conversations.',
		provider: 'Slack',
		iconPath: '/assets/slack-svgrepo-com.svg',
		iconColor: '#4A154B',
	},
	{
		name: 'Linear',
		key: 'linear',
		description:
			'Track issues and sync project tasks with your product development workflow.',
		provider: 'Linear',
		iconPath: '/assets/linear-svgrepo-com.svg',
		iconColor: '#5E6AD2',
	},
	{
		name: 'GitHub',
		key: 'github',
		description:
			'Connect code updates and track issue progress linked to customer requests.',
		provider: 'GitHub',
		iconPath: '/assets/github-142-svgrepo-com.svg',
		iconColor: '#24292e',
	},
	{
		name: 'Cursor',
		key: 'cursor',
		description:
			'Integrate your AI code editor for seamless development workflows.',
		provider: 'Anysphere',
		iconPath: '/assets/cursor.svg',
		iconColor: '#000000',
	},
	{
		name: 'MCP Tools',
		key: 'mcp',
		description:
			'Connect custom integrations and extend your workspace capabilities.',
		provider: 'MCP',
		iconPath: '/assets/mcp.svg',
		iconColor: '#007B66',
	},
]

export function LinkIntegrationDialog({
	isCollapsed,
}: {
	isCollapsed?: boolean
}) {
	const { organization } = useOrganization()
	const [isPending, startTransition] = useTransition()
	const [gmailConnecting, setGmailConnecting] = useState(false)
	const [slackConnecting, setSlackConnecting] = useState(false)

	const metadata = (organization?.publicMetadata ?? {}) as OrgPublicMetadata
	const orgIntegrations = metadata.integrations ?? {}

	const handleToggle = async (key: IntegrationName, isConnected: boolean) => {
		if (key === 'gmail') {
			if (isConnected) {
				// Disconnect Google
				startTransition(async () => {
					await disconnectGmail()
				})
			} else {
				// Initiate Google OAuth flow
				setGmailConnecting(true)
				try {
					const response = await fetch('/api/auth/google/initiate')
					const data = await response.json()

					if (data.error) {
						throw new Error(data.error)
					}

					if (data.authUrl) {
						globalThis.location.href = data.authUrl
					} else {
						throw new Error('No auth URL returned')
					}
				} catch (error) {
					console.error('Failed to initiate Google OAuth:', error)
					setGmailConnecting(false)
					alert('Failed to connect Google. Please try again.')
				}
			}
			return
		}

		if (key === 'slack') {
			if (isConnected) {
				// Disconnect Slack
				startTransition(async () => {
					await disconnectSlack()
				})
			} else {
				// Initiate Slack OAuth flow
				setSlackConnecting(true)
				try {
					globalThis.location.href = '/api/slack/authorize'
				} catch (error) {
					console.error('Failed to initiate Slack OAuth:', error)
					setSlackConnecting(false)
					alert('Failed to connect Slack. Please try again.')
				}
			}
			return
		}

		// For other integrations, use simple toggle
		startTransition(async () => {
			await toggleIntegration(key, !isConnected)
		})
	}

	return (
		<div
			className={cn(
				'mb-4',
				isCollapsed && 'opacity-0 max-w-0 overflow-hidden pointer-events-none'
			)}
		>
			<Dialog>
				<DialogTrigger asChild>
					<button
						type='button'
						className='flex w-full items-center gap-2 rounded-md p-2 text-sm hover:bg-primary/10 hover:text-primary transition-all duration-200 cursor-pointer group'
					>
						<Link2 className='size-4 flex-none group-hover:rotate-45 transition-transform duration-300' />
						<span className='truncate font-medium'>Integrations</span>
					</button>
				</DialogTrigger>
				<DialogContent className='sm:max-w-3xl max-h-[80vh] overflow-hidden flex flex-col'>
					<DialogHeader className='space-y-1.5 pb-3 border-b'>
						<DialogTitle className='text-lg font-bold flex items-center gap-2'>
							<Link2 className='size-4 text-primary' />
							Integrations
						</DialogTitle>
						<DialogDescription className='text-xs'>
							Connect your tools and services to enhance your workflow
						</DialogDescription>
					</DialogHeader>
					<div className='flex-1 overflow-y-auto pr-2 -mr-2 py-4'>
						<div className='grid grid-cols-2 gap-3'>
							{integrations.map((integration) => {
								const isConnected =
									orgIntegrations[integration.key]?.connected ?? false
								const isLoading =
									isPending ||
									(integration.key === 'gmail' && gmailConnecting) ||
									(integration.key === 'slack' && slackConnecting)

								return (
									<div
										key={integration.key}
										className={cn(
											'group relative rounded-md border bg-card p-3.5 transition-all duration-200',
											isConnected
												? 'border-primary/30 shadow-sm hover:shadow-md hover:border-primary/50'
												: 'border-border hover:border-border/80 hover:shadow-sm'
										)}
									>
										<div className='flex items-start gap-3'>
											{/* Icon */}
											<div
												className={cn(
													'flex size-10 shrink-0 items-center justify-center rounded-md bg-background border transition-all',
													isConnected ? 'border-primary/20' : 'border-border'
												)}
											>
												<Image
													src={integration.iconPath}
													alt={`${integration.name} icon`}
													width={24}
													height={24}
													className='size-6'
												/>
											</div>

											{/* Content */}
											<div className='flex-1 min-w-0'>
												<div className='flex items-start justify-between gap-2 mb-0.5'>
													<div>
														<h3 className='text-sm font-semibold text-foreground'>
															{integration.name}
														</h3>
														<p className='text-[10px] text-muted-foreground'>
															By {integration.provider}
														</p>
													</div>
												</div>
												<p className='text-xs text-muted-foreground leading-relaxed mt-1.5 mb-2.5'>
													{integration.description}
												</p>
												{/* Toggle/Button */}
												<div className='flex items-center justify-end gap-2'>
													{isLoading && (
														<Loader2 className='size-3.5 animate-spin text-muted-foreground' />
													)}
													{!isLoading && isConnected && (
														<div className='flex items-center gap-1.5'>
															<span className='text-[10px] font-medium text-primary'>
																Connected
															</span>
															<Switch
																checked={true}
																onCheckedChange={() =>
																	handleToggle(integration.key, isConnected)
																}
																className='data-[state=checked]:bg-primary scale-75'
															/>
														</div>
													)}
													{!isLoading && !isConnected && (
														<Button
															size='xs'
															onClick={() =>
																handleToggle(integration.key, isConnected)
															}
															className='h-6 px-3 text-xs font-medium'
														>
															Connect
														</Button>
													)}
												</div>
											</div>
										</div>
									</div>
								)
							})}
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	)
}
