import {
	BarChart3,
	Bell,
	BrainCircuit,
	MessageSquareText,
	Shield,
	Zap,
} from 'lucide-react'

const features = [
	{
		icon: MessageSquareText,
		title: 'AI Chat Interface',
		description:
			'Ask anything about your business. Get answers from across all your connected tools in natural language.',
	},
	{
		icon: BrainCircuit,
		title: 'Smart Insights',
		description:
			'Surface blockers, risks, and high-priority items before they escalate. AI that thinks like your chief of staff.',
	},
	{
		icon: Zap,
		title: 'Instant Actions',
		description:
			'Approve decisions, assign tasks, and send updates — all without leaving the chat window.',
	},
	{
		icon: BarChart3,
		title: 'Unified Dashboard',
		description:
			'One view across every department. Track OKRs, revenue, pipeline, and team velocity at a glance.',
	},
	{
		icon: Bell,
		title: 'Priority Alerts',
		description:
			'Only get notified about what truly needs your attention. AI filters noise so you can focus.',
	},
	{
		icon: Shield,
		title: 'Enterprise Security',
		description:
			'SOC 2 compliant with role-based access controls. Your data stays yours — always encrypted, always private.',
	},
]

const Features = () => {
	return (
		<section
			id='features'
			className='py-24 lg:py-32 bg-zinc-50 dark:bg-zinc-950'
		>
			<div className='container mx-auto px-4 md:px-6 max-w-6xl'>
				<div className='text-center mb-16'>
					<p className='text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-3'>
						Features
					</p>
					<h2 className='text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl'>
						Everything a leader needs,
						<br />
						nothing they don&apos;t
					</h2>
					<p className='mt-4 text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto'>
						Tambo OS replaces dozens of tabs and status meetings with a single
						intelligent workspace.
					</p>
				</div>
				<div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
					{features.map((feature) => (
						<div
							key={feature.title}
							className='group relative rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 hover:shadow-lg hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-300'
						>
							<div className='flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800 mb-5 group-hover:bg-zinc-200 dark:group-hover:bg-zinc-700 transition-colors'>
								<feature.icon className='h-6 w-6 text-zinc-700 dark:text-zinc-300' />
							</div>
							<h3 className='text-lg font-semibold mb-2'>{feature.title}</h3>
							<p className='text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed'>
								{feature.description}
							</p>
						</div>
					))}
				</div>
			</div>
		</section>
	)
}

export default Features
