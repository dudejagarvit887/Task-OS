import Image from 'next/image'
import Link from 'next/link'

const Logo = ({ withText }: { withText?: boolean }) => {
	return (
		<Link
			title='Home link'
			href='/'
			className='flex items-center justify-start gap-1.5 min-w-fit'
		>
			<Image
				src='/images/logo_light.svg'
				width={40}
				height={40}
				className='size-7 hidden dark:block'
				alt='Tambo OS logo'
			/>
			<Image
				src='/images/logo_dark.svg'
				width={40}
				height={40}
				className='size-7 block dark:hidden'
				alt='Tambo OS logo'
			/>
			{withText && (
				<span className='text-black dark:text-white font-bold text-lg tracking-tight'>
					Tambo OS
				</span>
			)}
		</Link>
	)
}

export default Logo
