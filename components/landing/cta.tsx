'use client'

import { useAuth } from '@clerk/nextjs'
import { ArrowRight, LayoutDashboard } from 'lucide-react'
import Link from 'next/link'

const CallToAction = () => {
	const { isSignedIn } = useAuth()

	return (
		<section className='py-24 lg:py-32 bg-white dark:bg-black'>
			<div className='container mx-auto px-4 md:px-6 max-w-4xl text-center'>
				<h2 className='text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl'>
					Stop managing tools.
					<br />
					Start leading.
				</h2>
				<p className='mt-6 text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed'>
					Join forward-thinking executives who use Tambo OS to cut through
					noise, make faster decisions, and stay ahead of what matters.
				</p>
				<div className='mt-10 flex flex-col sm:flex-row items-center justify-center gap-4'>
					{isSignedIn ? (
						<Link
							href='/dashboard'
							className='group flex items-center gap-2 rounded-full bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg shadow-black/10'
						>
							<LayoutDashboard className='h-4 w-4' />
							Go to Dashboard
							<ArrowRight className='h-4 w-4 transition-transform group-hover:translate-x-1' />
						</Link>
					) : (
						<Link
							href='/sign-up'
							className='group flex items-center gap-2 rounded-full bg-primary px-10 py-4 text-base font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg shadow-black/10'
						>
							Get Started — It&apos;s Free
							<ArrowRight className='h-4 w-4 transition-transform group-hover:translate-x-1' />
						</Link>
					)}
				</div>
				<p className='mt-4 text-xs text-zinc-500 dark:text-zinc-500'>
					No credit card required. Set up in under 2 minutes.
				</p>
			</div>
		</section>
	)
}

export default CallToAction
