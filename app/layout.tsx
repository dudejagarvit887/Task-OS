import { auth } from '@clerk/nextjs/server'
import type { Metadata } from 'next'
import { Space_Grotesk } from 'next/font/google'
import { LayoutWrapper } from '@/components/layout-wrapper'
import { TamboWrapper } from '@/components/tambo-wrapper'
import { ThemeProvider } from '@/components/theme-switcher/theme-provider'
import './globals.css'

const spaceGrotesk = Space_Grotesk({
	variable: '--font-space-grotesk',
	display: 'swap',
	subsets: ['latin'],
})

export const metadata: Metadata = {
	title: 'Tambo OS - AI Chat Platform',
	description:
		'An AI-powered chat platform built with Next.js, Clerk auth, Tambo AI, and shadcn/ui. Features real-time AI chat with organization workspaces and tool integrations.',
}

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	const { getToken } = await auth()
	const token = await getToken()

	return (
		<html lang='en' suppressHydrationWarning>
			<body
				className={`${spaceGrotesk.variable} antialiased bg-white dark:bg-black`}
			>
				<ThemeProvider
					attribute='class'
					defaultTheme='system'
					enableSystem
					disableTransitionOnChange
				>
					<TamboWrapper userToken={token ?? undefined}>
						<LayoutWrapper>{children}</LayoutWrapper>
					</TamboWrapper>
				</ThemeProvider>
			</body>
		</html>
	)
}
