import { SignIn } from '@clerk/nextjs'

// Force dynamic rendering to prevent build-time errors
export const dynamic = 'force-dynamic'

export default function SignInPage() {
    // Check if Clerk is configured
    const isClerkConfigured = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

    if (!isClerkConfigured) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
                <div className="text-center text-white">
                    <h1 className="text-2xl font-bold mb-4">Authentication Not Configured</h1>
                    <p className="text-slate-400">Please configure Clerk authentication keys.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            {/* Background decorative elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
            </div>

            {/* Sign In Component */}
            <div className="relative z-10">
                <SignIn
                    appearance={{
                        elements: {
                            rootBox: "mx-auto",
                            card: "bg-slate-800/80 backdrop-blur-xl border border-slate-700/50 shadow-2xl",
                            headerTitle: "text-white font-bold",
                            headerSubtitle: "text-slate-400",
                            socialButtonsBlockButton: "bg-slate-700/50 border-slate-600 text-white hover:bg-slate-600/50",
                            socialButtonsBlockButtonText: "text-white",
                            dividerLine: "bg-slate-600",
                            dividerText: "text-slate-400",
                            formFieldLabel: "text-slate-300",
                            formFieldInput: "bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500",
                            formButtonPrimary: "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700",
                            footerActionLink: "text-cyan-400 hover:text-cyan-300",
                            footer: "hidden"
                        },
                    }}
                    forceRedirectUrl="/admin/cars"
                />
            </div>
        </div>
    )
}

