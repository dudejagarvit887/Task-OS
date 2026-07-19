import Hero from '@/components/hero'
import CallToAction from '@/components/landing/cta'
import Features from '@/components/landing/features'
import HowItWorks from '@/components/landing/how-it-works'
import Integrations from '@/components/landing/integrations'

export default function Home() {
	return (
		<main className='flex min-h-screen flex-col bg-white dark:bg-black'>
			<Hero />
			<Features />
			<Integrations />
			<HowItWorks />
			<CallToAction />
		</main>
	)
}
