'use client'

import { usePathname } from 'next/navigation'
import Footer from '@/components/footer'
import Header from '@/components/header'

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
	const pathname = usePathname()
	const isProtectedRoute =
		pathname?.startsWith('/dashboard') || pathname?.startsWith('/onboarding')

	return (
		<>
			{!isProtectedRoute && <Header />}
			{children}
			{!isProtectedRoute && <Footer />}
		</>
	)
}
