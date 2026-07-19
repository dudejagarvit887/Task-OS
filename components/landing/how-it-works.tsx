import { Link2, MessageSquare, Sparkles } from 'lucide-react'

const steps = [
	{
		step: '01',
		icon: Link2,
		title: 'Connect your tools',
		description:
			'Link Slack, Gmail, Notion, Jira, and more in a few clicks. Tambo OS securely syncs your data in real time.',
	},
	{
		step: '02',
		icon: MessageSquare,
		title: 'Ask anything',
		description:
			'Use natural language to ask about blockers, priorities, team updates, or company goals. No dashboards to learn.',
	},
	{
		step: '03',
		icon: Sparkles,
		title: 'Act instantly',
		description:
			'Get AI-synthesized answers and take action right from the chat — approve, delegate, schedule, or follow up.',
	},
]

const HowItWorks = () => {
	return (
		<section
			id='how-it-works'
			className='py-24 lg:py-32 bg-zinc-50 dark:bg-zinc-950'
		>
			<div className='container mx-auto px-4 md:px-6 max-w-5xl'>
				<div className='text-center mb-16'>
					<p className='text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-3'>
						How It Works
					</p>
					<h2 className='text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl'>
						From chaos to clarity
						<br />
						in three steps
					</h2>
				</div>
				<div className='grid gap-8 md:grid-cols-3'>
					{steps.map((step) => (
						<div key={step.step} className='relative text-center'>
							<div className='flex justify-center mb-6'>
								<div className='relative'>
									<div className='flex h-16 w-16 items-center justify-center rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm'>
										<step.icon className='h-7 w-7 text-zinc-700 dark:text-zinc-300' />
									</div>
									<span className='absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold'>
										{step.step}
									</span>
								</div>
							</div>
							<h3 className='text-xl font-semibold mb-3'>{step.title}</h3>
							<p className='text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-xs mx-auto'>
								{step.description}
							</p>
						</div>
					))}
				</div>
			</div>
		</section>
	)
}

export default HowItWorks
