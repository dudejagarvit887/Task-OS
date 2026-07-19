import { AppSidebar } from '@/components/app-sidebar'

export default async function ProtectedLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<div className='flex h-svh overflow-hidden'>
			<AppSidebar />
			<main className='flex min-h-0 flex-1 flex-col overflow-hidden'>
				{children}
			</main>
		</div>
	)
}
