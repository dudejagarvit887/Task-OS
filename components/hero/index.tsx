'use client'

import { useAuth } from '@clerk/nextjs'
import { ArrowRight, LayoutDashboard } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const Hero = () => {
	const { isSignedIn } = useAuth()

	return (
		<section className='relative flex w-full items-center justify-center bg-gradient-to-b from-background via-primary/5 to-background overflow-hidden'>
			<div
				className={cn(
					'absolute inset-0',
					'[background-size:40px_40px]',
					'[background-image:linear-gradient(to_right,oklch(0.48_0.12_180_/_0.1)_1px,transparent_1px),linear-gradient(to_bottom,oklch(0.48_0.12_180_/_0.1)_1px,transparent_1px)]'
				)}
			/>
			<div className='pointer-events-none absolute inset-0 flex items-center justify-center bg-gradient-to-b from-transparent via-primary/5 to-transparent [mask-image:radial-gradient(ellipse_at_center,transparent_30%,black)]' />

			{/* Animated gradient orbs */}
			<div className='absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse' />
			<div className='absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse delay-1000' />

			<div className='relative container mx-auto px-4 md:px-6 2xl:max-w-[1400px] py-24 lg:py-36'>
				<div className='mx-auto max-w-4xl text-center'>
					<div className='inline-flex items-center gap-2 rounded-full border-2 border-primary/30 bg-primary/10 px-5 py-2 text-sm font-medium text-primary mb-8 shadow-lg shadow-primary/10'>
						<span className='relative flex h-2 w-2'>
							<span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75' />
							<span className='relative inline-flex rounded-full h-2 w-2 bg-primary' />
						</span>
						Your AI-powered command center for leadership
					</div>
					<h1 className='scroll-m-20 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-7xl bg-gradient-to-br from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent pb-2 drop-shadow-sm'>
						One OS for every
						<br />
						decision that matters
					</h1>
					<p className='mx-auto mt-6 max-w-2xl text-lg text-foreground/70 leading-relaxed'>
						Tambo OS connects your tools, surfaces critical insights, and lets
						you act — all from a single AI-powered chat interface built for
						C-suite leaders.
					</p>
					<div className='mt-10 flex flex-col sm:flex-row items-center justify-center gap-4'>
						{isSignedIn ? (
							<Link
								href='/dashboard'
								className='group flex items-center gap-2 rounded-xl bg-primary px-8 py-4 text-base font-bold text-primary-foreground hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 hover:scale-105'
							>
								<LayoutDashboard className='h-5 w-5' />
								Go to Dashboard
								<ArrowRight className='h-5 w-5 transition-transform group-hover:translate-x-1' />
							</Link>
						) : (
							<>
								<Link
									href='/sign-up'
									className='group flex items-center gap-2 rounded-xl bg-primary px-8 py-4 text-base font-bold text-primary-foreground hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 hover:scale-105'
								>
									Start for Free
									<ArrowRight className='h-5 w-5 transition-transform group-hover:translate-x-1' />
								</Link>
								<Link
									href='#how-it-works'
									className='flex items-center gap-2 rounded-xl border-2 border-primary/30 bg-primary/5 px-8 py-4 text-base font-bold text-primary hover:bg-primary/10 hover:border-primary/50 transition-all'
								>
									See How It Works
								</Link>
							</>
						)}
					</div>
				</div>

				{/* Dashboard Preview */}
				<div className='mt-20 mx-auto max-w-5xl'>
					<div className='relative rounded-2xl border-2 border-primary/20 bg-gradient-to-b from-primary/5 to-background shadow-2xl shadow-primary/20 overflow-hidden ring-1 ring-primary/10'>
						<div className='flex items-center gap-2 px-4 py-3 border-b-2 border-primary/20 bg-primary/10 backdrop-blur-sm'>
							<div className='flex gap-1.5'>
								<div className='h-3 w-3 rounded-full bg-red-400 shadow-sm' />
								<div className='h-3 w-3 rounded-full bg-yellow-400 shadow-sm' />
								<div className='h-3 w-3 rounded-full bg-green-400 shadow-sm' />
							</div>
							<div className='flex-1 flex justify-center'>
								<div className='bg-primary/20 backdrop-blur-sm rounded-lg px-4 py-1.5 text-xs font-medium text-primary border border-primary/20'>
									app.tamboos.com
								</div>
							</div>
						</div>
						<Image
							src='/images/dashboard.png'
							alt='Tambo OS Dashboard'
							width={1200}
							height={700}
							className='w-full'
							priority
						/>
					</div>
				</div>
			</div>
		</section>
	)
}

export default Hero
