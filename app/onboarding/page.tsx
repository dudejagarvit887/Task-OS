'use client'

import { useOrganizationList, useUser } from '@clerk/nextjs'
import {
	ArrowLeft,
	ArrowRight,
	Building2,
	Check,
	HeadsetIcon,
	Loader2,
	Plug,
	Shield,
	User,
	Users,
	X,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createOrganization, type WorkspaceType } from './actions'

const workspaceOptions = [
	{
		type: 'solo' as WorkspaceType,
		title: 'Solo Workspace',
		description: 'Perfect for freelancers and individual professionals',
		icon: User,
		badge: 'Starter',
		badgeVariant: 'secondary' as const,
		features: [
			{ label: 'Up to 5 team members', included: true, icon: Users },
			{ label: 'Standard integrations', included: true, icon: Plug },
			{ label: 'Basic security', included: true, icon: Shield },
			{ label: 'Community support', included: true, icon: HeadsetIcon },
			{ label: 'Enterprise integrations', included: false, icon: Plug },
			{ label: 'Advanced security & SSO', included: false, icon: Shield },
			{ label: 'Unlimited members', included: false, icon: Users },
			{ label: 'Priority support', included: false, icon: HeadsetIcon },
		],
	},
	{
		type: 'company' as WorkspaceType,
		title: 'Company Workspace',
		description: 'Built for teams and organizations of any size',
		icon: Building2,
		badge: 'Enterprise',
		badgeVariant: 'default' as const,
		features: [
			{ label: 'Unlimited team members', included: true, icon: Users },
			{ label: 'Enterprise integrations', included: true, icon: Plug },
			{ label: 'Advanced security & SSO', included: true, icon: Shield },
			{ label: 'Priority support', included: true, icon: HeadsetIcon },
			{ label: 'Custom roles & permissions', included: true, icon: Shield },
			{ label: 'Audit logs', included: true, icon: Shield },
			{ label: 'Dedicated account manager', included: true, icon: HeadsetIcon },
			{ label: 'SLA guarantees', included: true, icon: HeadsetIcon },
		],
	},
]

export default function OnboardingPage() {
	const { user } = useUser()
	const { setActive } = useOrganizationList()
	const router = useRouter()
	const [selectedType, setSelectedType] = useState<WorkspaceType | null>(null)
	const [step, setStep] = useState<'select' | 'name'>('select')
	const [workspaceName, setWorkspaceName] = useState('')
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState('')

	const handleContinue = () => {
		if (!selectedType) return
		const defaultName =
			selectedType === 'solo' ? `${user?.firstName ?? 'My'}'s Workspace` : ''
		setWorkspaceName(defaultName)
		setStep('name')
	}

	const handleCreate = async () => {
		if (!selectedType || !workspaceName.trim()) return

		setLoading(true)
		setError('')

		const result = await createOrganization(selectedType, workspaceName.trim())

		if (result.error) {
			setError(result.error)
			setLoading(false)
			return
		}

		if (setActive && result.organizationId) {
			await setActive({ organization: result.organizationId })
		}

		router.push('/dashboard')
	}

	return (
		<div className='min-h-screen flex items-center justify-center bg-background p-4'>
			<div className='w-full max-w-4xl space-y-8'>
				{/* Header */}
				<div className='text-center space-y-2'>
					<h1 className='text-3xl font-bold tracking-tight'>
						Welcome{user?.firstName ? `, ${user.firstName}` : ''}!
					</h1>
					<p className='text-muted-foreground text-lg'>
						{step === 'select'
							? 'Choose a workspace type to get started'
							: 'Name your workspace'}
					</p>

					{/* Step indicator */}
					<div className='flex items-center justify-center gap-2 pt-4'>
						<div className='flex items-center gap-2'>
							<div className='h-2 w-8 rounded-full bg-primary' />
							<div
								className={`h-2 w-8 rounded-full ${
									step === 'name' ? 'bg-primary' : 'bg-muted'
								}`}
							/>
						</div>
					</div>
				</div>

				{step === 'select' && (
					<>
						{/* Workspace selection cards */}
						<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
							{workspaceOptions.map((option) => {
								const Icon = option.icon
								const isSelected = selectedType === option.type

								return (
									<Card
										key={option.type}
										className={`cursor-pointer transition-all hover:shadow-md ${
											isSelected
												? 'ring-2 ring-primary shadow-md'
												: 'hover:border-muted-foreground/30'
										}`}
										onClick={() => setSelectedType(option.type)}
									>
										<CardHeader>
											<div className='flex items-center justify-between'>
												<div className='flex items-center gap-3'>
													<div
														className={`p-2 rounded-lg ${
															isSelected
																? 'bg-primary text-primary-foreground'
																: 'bg-muted'
														}`}
													>
														<Icon className='h-5 w-5' />
													</div>
													<div>
														<CardTitle>{option.title}</CardTitle>
														<CardDescription className='mt-1'>
															{option.description}
														</CardDescription>
													</div>
												</div>
												<Badge variant={option.badgeVariant}>
													{option.badge}
												</Badge>
											</div>
										</CardHeader>

										<CardContent>
											<div className='space-y-3'>
												{option.features.map((feature) => {
													const FeatureIcon = feature.icon
													return (
														<div
															key={feature.label}
															className='flex items-center gap-3'
														>
															{feature.included ? (
																<Check className='h-4 w-4 text-green-500 shrink-0' />
															) : (
																<X className='h-4 w-4 text-muted-foreground/40 shrink-0' />
															)}
															<FeatureIcon className='h-4 w-4 text-muted-foreground shrink-0' />
															<span
																className={`text-sm ${
																	feature.included
																		? 'text-foreground'
																		: 'text-muted-foreground/50'
																}`}
															>
																{feature.label}
															</span>
														</div>
													)
												})}
											</div>
										</CardContent>

										<CardFooter>
											<div
												className={`w-full text-center text-sm font-medium py-2 rounded-md ${
													isSelected
														? 'bg-primary/10 text-primary'
														: 'text-muted-foreground'
												}`}
											>
												{isSelected ? 'Selected' : 'Click to select'}
											</div>
										</CardFooter>
									</Card>
								)
							})}
						</div>

						{/* Continue button */}
						<div className='flex justify-center'>
							<Button
								size='lg'
								disabled={!selectedType}
								onClick={handleContinue}
								className='min-w-[200px]'
							>
								Continue
								<ArrowRight className='ml-2 h-4 w-4' />
							</Button>
						</div>
					</>
				)}

				{step === 'name' && (
					<Card className='max-w-md mx-auto'>
						<CardHeader>
							<div className='flex items-center gap-3'>
								<div className='p-2 rounded-lg bg-primary text-primary-foreground'>
									{selectedType === 'solo' ? (
										<User className='h-5 w-5' />
									) : (
										<Building2 className='h-5 w-5' />
									)}
								</div>
								<div>
									<CardTitle>
										{selectedType === 'solo'
											? 'Solo Workspace'
											: 'Company Workspace'}
									</CardTitle>
									<CardDescription>Give your workspace a name</CardDescription>
								</div>
							</div>
						</CardHeader>

						<CardContent className='space-y-4'>
							<div className='space-y-2'>
								<Label htmlFor='workspace-name'>Workspace name</Label>
								<Input
									id='workspace-name'
									placeholder={
										selectedType === 'solo'
											? 'e.g. My Workspace'
											: 'e.g. Acme Inc.'
									}
									value={workspaceName}
									onChange={(e) => setWorkspaceName(e.target.value)}
									onKeyDown={(e) => {
										if (e.key === 'Enter') handleCreate()
									}}
								/>
							</div>

							{error && <p className='text-sm text-destructive'>{error}</p>}
						</CardContent>

						<CardFooter className='flex justify-between'>
							<Button
								variant='ghost'
								onClick={() => setStep('select')}
								disabled={loading}
							>
								<ArrowLeft className='mr-2 h-4 w-4' />
								Back
							</Button>
							<Button
								onClick={handleCreate}
								disabled={!workspaceName.trim() || loading}
							>
								{loading ? (
									<>
										<Loader2 className='mr-2 h-4 w-4 animate-spin' />
										Creating...
									</>
								) : (
									<>
										Create Workspace
										<ArrowRight className='ml-2 h-4 w-4' />
									</>
								)}
							</Button>
						</CardFooter>
					</Card>
				)}
			</div>
		</div>
	)
}
