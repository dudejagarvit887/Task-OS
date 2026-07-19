'use client'
import { useAuth } from '@clerk/nextjs'
import { ArrowRight, LayoutDashboard, Menu, X } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import Logo from '@/components/logo'
import { Button } from '@/components/ui/button'
import { ThemeSwitcher } from '../theme-switcher'

const Header = () => {
	const [isOpen, setOpen] = useState(false)
	const { isSignedIn } = useAuth()
	const navigation = [
		{ title: 'Features', path: '#features' },
		{ title: 'Integrations', path: '#integrations' },
		{ title: 'How It Works', path: '#how-it-works' },
	]
	const toggleMenu = () => {
		setOpen(!isOpen)
	}
	return (
		<>
			{/* Mobile Header */}
			<div className='md:hidden bg-background/95 backdrop-blur-lg sticky top-0 z-50 border-b border-primary/10 shadow-sm'>
				<div className='flex items-center justify-between py-4 px-4'>
					<Logo withText />
					<div className='flex items-center gap-2'>
						<ThemeSwitcher />
						<Button
							variant='ghost'
							size='icon'
							onClick={toggleMenu}
							className='hover:bg-primary/10 hover:text-primary'
						>
							{isOpen ? (
								<X className='h-5 w-5' />
							) : (
								<Menu className='h-5 w-5' />
							)}
						</Button>
					</div>
				</div>
				{/* Mobile Menu */}
				{isOpen && (
					<div className='fixed inset-0 z-50 bg-background'>
						<div className='flex flex-col h-full'>
							<div className='flex items-center justify-between p-4 border-b border-primary/10 bg-primary/5'>
								<Logo withText />
								<Button
									variant='ghost'
									size='icon'
									onClick={toggleMenu}
									className='hover:bg-primary/10 hover:text-primary'
								>
									<X className='h-5 w-5' />
								</Button>
							</div>
							<div className='flex-1 p-6'>
								<ul className='space-y-1'>
									{navigation.map((item) => (
										<li key={item.title}>
											<Link
												href={item.path}
												onClick={toggleMenu}
												className='block py-3 px-4 text-lg font-medium text-foreground/70 hover:text-primary hover:bg-primary/5 rounded-lg transition-all'
											>
												{item.title}
											</Link>
										</li>
									))}
								</ul>
							</div>
							<div className='p-4 border-t border-primary/10 space-y-3 bg-primary/5'>
								{isSignedIn ? (
									<Link
										href='/dashboard'
										className='flex items-center justify-center gap-2 w-full py-3 px-4 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-all shadow-md hover:shadow-lg'
									>
										<LayoutDashboard className='h-4 w-4' />
										Dashboard
									</Link>
								) : (
									<>
										<Link
											href='/sign-in'
											className='flex items-center justify-center w-full py-3 px-4 text-sm font-medium text-foreground border-2 border-primary/20 hover:border-primary/40 hover:bg-primary/5 rounded-xl transition-all'
										>
											Sign in
										</Link>
										<Link
											href='/sign-up'
											className='flex items-center justify-center gap-1 w-full py-3 px-4 text-sm font-semibold bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all shadow-md hover:shadow-lg'
										>
											Get Started
											<ArrowRight className='h-4 w-4' />
										</Link>
									</>
								)}
							</div>
						</div>
					</div>
				)}
			</div>

			{/* Desktop Header */}
			<nav className='hidden md:block sticky top-0 z-50 bg-background/95 backdrop-blur-lg border-b border-primary/10 shadow-sm'>
				<div className='max-w-7xl mx-auto px-6 lg:px-8'>
					<div className='flex items-center justify-between h-16'>
						<Logo withText />
						<ul className='flex items-center gap-8'>
							{navigation.map((item) => (
								<li key={item.title}>
									<Link
										href={item.path}
										className='text-sm font-medium text-foreground/70 hover:text-primary transition-all relative group'
									>
										{item.title}
										<span className='absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300' />
									</Link>
								</li>
							))}
						</ul>
						<div className='flex items-center gap-3'>
							<ThemeSwitcher />
							{isSignedIn ? (
								<Link
									href='/dashboard'
									className='flex items-center gap-2 py-2 px-5 text-sm font-semibold bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all shadow-md hover:shadow-lg'
								>
									<LayoutDashboard className='h-4 w-4' />
									Dashboard
								</Link>
							) : (
								<>
									<Link
										href='/sign-in'
										className='py-2 px-4 text-sm font-medium text-foreground/70 hover:text-primary transition-all'
									>
										Sign in
									</Link>
									<Link
										href='/sign-up'
										className='flex items-center gap-1 py-2 px-5 text-sm font-semibold bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all shadow-md hover:shadow-lg'
									>
										Get Started
										<ArrowRight className='h-3.5 w-3.5' />
									</Link>
								</>
							)}
						</div>
					</div>
				</div>
			</nav>
		</>
	)
}

export default Header
