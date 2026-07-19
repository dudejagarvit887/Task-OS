import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isProtectedRoute = createRouteMatcher(['/dashboard(.*)'])

const isOnboardingRoute = createRouteMatcher(['/onboarding(.*)'])
const isAuthRoute = createRouteMatcher([
	'/sign-in(.*)',
	'/sign-up(.*)',
	'/forgot-password(.*)',
])

export default clerkMiddleware(async (auth, req) => {
	const { userId, orgId } = await auth()

	// Not logged in — redirect to sign-in if accessing protected or onboarding routes
	if (!userId && (isProtectedRoute(req) || isOnboardingRoute(req))) {
		return NextResponse.redirect(new URL('/sign-in', req.url))
	}

	// Logged in but has no organization — redirect to onboarding
	// (unless already on onboarding or on the landing page)
	if (
		userId &&
		!orgId &&
		!isOnboardingRoute(req) &&
		req.nextUrl.pathname !== '/'
	) {
		return NextResponse.redirect(new URL('/onboarding', req.url))
	}

	// Logged in, has organization, but trying to access onboarding — redirect to dashboard
	if (userId && orgId && isOnboardingRoute(req)) {
		return NextResponse.redirect(new URL('/dashboard', req.url))
	}

	// Logged in with org, accessing auth routes (sign-in/sign-up) — redirect to dashboard
	if (userId && orgId && isAuthRoute(req)) {
		return NextResponse.redirect(new URL('/dashboard', req.url))
	}
})

export const config = {
	matcher: [
		// Skip Next.js internals and all static files, unless found in search params
		'/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
		// Always run for API routes
		'/(api|trpc)(.*)',
	],
}
