export type FooterNavItem = {
	title: string
	href: string
}

export type FooterSection = {
	title: string
	items: FooterNavItem[]
}

export const footerConfig = {
	description: {
		primary: 'The AI-powered operating system for executive leadership.',
		secondary:
			'Connect your tools, surface insights, and act — all from one intelligent interface.',
	},
	sections: [
		{
			title: 'Product',
			items: [
				{ title: 'Features', href: '#features' },
				{ title: 'Integrations', href: '#integrations' },
				{ title: 'How It Works', href: '#how-it-works' },
				{ title: 'Pricing', href: '#' },
			],
		},
		{
			title: 'Company',
			items: [
				{ title: 'About', href: '#' },
				{ title: 'Blog', href: '#' },
				{ title: 'Careers', href: '#' },
			],
		},
		{
			title: 'Legal',
			items: [
				{ title: 'Privacy Policy', href: '#' },
				{ title: 'Terms of Service', href: '#' },
				{ title: 'Security', href: '#' },
			],
		},
	],
}
