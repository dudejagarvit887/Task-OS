import { useClerk, useSignIn, useSignUp } from '@clerk/nextjs'
import { redirect } from 'next/navigation'
import { useState } from 'react'

interface SignInData {
	email: string
	password: string
}

interface SignUpData {
	firstName: string
	lastName: string
	email: string
	password: string
}

interface ResetPasswordData {
	email: string
	code?: string
	password?: string
}

export function useAuth() {
	const [error, setError] = useState('')
	const [loading, setLoading] = useState(false)
	const [successMessage, setSuccessMessage] = useState('')
	const [stage, setStage] = useState<'request' | 'reset'>('request')

	const {
		signIn,
		isLoaded: isSignInLoaded,
		setActive: setSignInActive,
	} = useSignIn()
	const {
		signUp,
		isLoaded: isSignUpLoaded,
		setActive: setSignUpActive,
	} = useSignUp()
	const clerk = useClerk()

	const isLoaded = isSignInLoaded && isSignUpLoaded

	const handleSignIn = async (data: SignInData) => {
		if (!signIn || !setSignInActive) return

		setError('')
		setLoading(true)

		try {
			const result = await signIn.create({
				identifier: data.email,
				password: data.password,
			})

			if (result.status === 'complete') {
				if (result.createdSessionId) {
					setSignInActive({ session: result.createdSessionId })
					clerk.redirectToAfterSignIn()
				} else {
					setError(
						"Account created but couldn't start session. Please sign in."
					)
					redirect('/sign-in')
				}
			} else {
				console.error('Sign in failed', result)
				setError('Sign in failed. Please check your credentials.')
			}
		} catch (err) {
			console.error('Error:', err)
			const message =
				err instanceof Error ? err.message : 'An error occurred during sign in'
			setError(message)
		} finally {
			setLoading(false)
		}
	}

	const handleSignUp = async (data: SignUpData) => {
		if (!signUp || !setSignUpActive) return

		setError('')
		setLoading(true)

		try {
			const result = await signUp.create({
				firstName: data.firstName,
				lastName: data.lastName,
				emailAddress: data.email,
				password: data.password,
			})

			if (result.status === 'complete') {
				if (result.createdSessionId) {
					setSignUpActive({ session: result.createdSessionId })
					clerk.redirectToAfterSignUp()
				} else {
					setError(
						"Account created but couldn't start session. Please sign in."
					)
					redirect('/sign-in')
				}
			} else {
				console.error('Sign up failed', result)
				setError('Sign up failed. Please try again.')
			}
		} catch (err) {
			console.error('Error:', err)
			const message =
				err instanceof Error ? err.message : 'An error occurred during sign up'
			setError(message)
		} finally {
			setLoading(false)
		}
	}

	const handleRequestReset = async (data: ResetPasswordData) => {
		if (!signIn) return

		setError('')
		setLoading(true)

		try {
			await signIn.create({
				strategy: 'reset_password_email_code',
				identifier: data.email,
			})
			setStage('reset')
			setSuccessMessage('Reset code sent to your email')
		} catch (err) {
			console.error('Error:', err)
			const message = err instanceof Error ? err.message : 'An error occurred'
			setError(message)
		} finally {
			setLoading(false)
		}
	}

	const handleResetPassword = async (data: ResetPasswordData) => {
		if (!signIn || !setSignInActive) return
		if (!data.code || !data.password) {
			setError('Code and password are required')
			return
		}

		setError('')
		setLoading(true)

		try {
			const result = await signIn.attemptFirstFactor({
				strategy: 'reset_password_email_code',
				code: data.code,
				password: data.password,
			})

			if (result.status === 'complete') {
				setSuccessMessage('Password reset successful!')
				setSignInActive({ session: result.createdSessionId })
				clerk.redirectToAfterSignIn()
			} else {
				setError('Password reset failed. Please try again.')
			}
		} catch (err) {
			console.error('Error:', err)
			const message = err instanceof Error ? err.message : 'An error occurred'
			setError(message)
		} finally {
			setLoading(false)
		}
	}

	return {
		error,
		loading,
		successMessage,
		stage,
		isLoaded,
		handleSignIn,
		handleSignUp,
		handleRequestReset,
		handleResetPassword,
		setError,
		setSuccessMessage,
	}
}
