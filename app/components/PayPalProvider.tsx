"use client"

import React, { useEffect, useState, useMemo } from "react"
import { PayPalScriptProvider } from "@paypal/react-paypal-js"

export function PayPalProvider({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const options = useMemo(() => {
        const cid = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
        console.log("PayPalProvider Client ID available:", !!cid);
        return {
            clientId: cid || "sb",
            currency: "USD",
        };
    }, [])

    if (!mounted) {
        return <>{children}</>
    }

    return (
        <PayPalScriptProvider options={options}>
            {children}
        </PayPalScriptProvider>
    )
}
