import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { ClerkProvider } from "@clerk/nextjs"
import { ThemeContextProvider } from "./context/ThemeContext"
import { DomainContextProvider } from "./context/DomainContext"
import { GeolocationProvider } from "./context/GeolocationContext"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Airport Transfers & Car Rentals",
  description: "Book airport transfers and car rentals easily",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

import { PayPalProvider } from "./components/PayPalProvider"

// Conditional Clerk wrapper - only wraps when publishable key is available
function ConditionalClerkProvider({ children }: { children: React.ReactNode }) {
  const clerkPubKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

  if (clerkPubKey) {
    return <ClerkProvider publishableKey={clerkPubKey}>{children}</ClerkProvider>
  }

  return <>{children}</>
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ConditionalClerkProvider>
      <html lang="en">
        <body className={`font-sans antialiased`} suppressHydrationWarning>
          <DomainContextProvider>
            <GeolocationProvider>
              <ThemeContextProvider>
                <PayPalProvider>
                  {children}
                </PayPalProvider>
              </ThemeContextProvider>
            </GeolocationProvider>
          </DomainContextProvider>
          <Analytics />
        </body>
      </html>
    </ConditionalClerkProvider>
  )
}
