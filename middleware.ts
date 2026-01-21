import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define protected routes - all admin routes require authentication
const isProtectedRoute = createRouteMatcher(['/admin(.*)'])

// Check if Clerk is configured
const isClerkConfigured = () => {
  return !!(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY)
}

// Conditional middleware - only use Clerk if configured
export default function middleware(req: NextRequest) {
  // If Clerk is not configured, allow all requests through
  if (!isClerkConfigured()) {
    return NextResponse.next()
  }

  // Use Clerk middleware when configured
  return clerkMiddleware(async (auth, request) => {
    if (isProtectedRoute(request)) {
      await auth.protect()
    }
  })(req, {} as any)
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}

