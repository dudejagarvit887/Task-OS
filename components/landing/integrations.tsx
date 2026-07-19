import {
	Calendar,
	FileText,
	GitBranch,
	Mail,
	MessageCircle,
	Trello,
} from 'lucide-react'

const integrations = [
	{
		name: 'Slack',
		icon: MessageCircle,
		color:
			'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
	},
	{
		name: 'Gmail',
		icon: Mail,
		color: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
	},
	{
		name: 'Notion',
		icon: FileText,
		color: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300',
	},
	{
		name: 'Google Calendar',
		icon: Calendar,
		color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
	},
	{
		name: 'Jira',
		icon: Trello,
		color: 'bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400',
	},
	{
		name: 'GitHub',
		icon: GitBranch,
		color: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300',
	},
]

const Integrations = () => {
	return (
		<section
			id='integrations'
			className='py-24 lg:py-32 bg-white dark:bg-black'
		>
			<div className='container mx-auto px-4 md:px-6 max-w-6xl'>
				<div className='grid lg:grid-cols-2 gap-16 items-center'>
					<div>
						<p className='text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-3'>
							Integrations
						</p>
						<h2 className='text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl'>
							All your tools,
							<br />
							one conversation
						</h2>
						<p className='mt-4 text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed'>
							Connect the platforms your teams already use. Tambo OS pulls
							context from every tool so you never have to switch tabs to get
							the full picture.
						</p>
						<p className='mt-4 text-sm text-zinc-500 dark:text-zinc-500'>
							Integrations are set up in seconds — no engineering required.
						</p>
					</div>
					<div className='grid grid-cols-2 sm:grid-cols-3 gap-4'>
						{integrations.map((integration) => (
							<div
								key={integration.name}
								className='flex flex-col items-center gap-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-6 hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-300'
							>
								<div
									className={`flex h-12 w-12 items-center justify-center rounded-xl ${integration.color}`}
								>
									<integration.icon className='h-6 w-6' />
								</div>
								<span className='text-sm font-medium text-zinc-700 dark:text-zinc-300'>
									{integration.name}
								</span>
							</div>
						))}
					</div>
				</div>
			</div>
		</section>
	)
}

export default Integrations
