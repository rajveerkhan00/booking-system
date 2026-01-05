'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'

export interface DomainCarConfig {
    carId: string
    price: number
    isVisible: boolean
}

export interface DomainConfig {
    _id: string
    domainName: string
    themeId?: string
    cars: DomainCarConfig[]
    isActive: boolean
}

interface DomainContextType {
    domainConfig: DomainConfig | null
    loading: boolean
    error: string | null
    refreshDomainConfig: () => Promise<void>
}

const DomainContext = createContext<DomainContextType>({
    domainConfig: null,
    loading: true,
    error: null,
    refreshDomainConfig: async () => { }
})

export const useDomain = () => useContext(DomainContext)

export const DomainContextProvider = ({ children }: { children: ReactNode }) => {
    const [domainConfig, setDomainConfig] = useState<DomainConfig | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchDomainConfig = useCallback(async () => {
        try {
            setLoading(true)

            // Determine the domain to check (priority order):
            // 1. URL parameter 'domain'
            // 2. Parent page referrer (if in iframe)
            // 3. Current hostname
            const params = new URLSearchParams(window.location.search)
            const domainOverride = params.get('domain')

            let hostname = window.location.hostname

            // Check if we're in an iframe and get parent domain from referrer
            if (!domainOverride && window.parent !== window && document.referrer) {
                try {
                    const referrerUrl = new URL(document.referrer)
                    hostname = referrerUrl.hostname
                    console.log('🌐 Detected iframe embedding from:', hostname)
                } catch (e) {
                    console.warn('Could not parse referrer URL:', e)
                }
            }

            const domainToCheck = domainOverride || hostname
            console.log('🔍 Checking domain configuration for:', domainToCheck)

            const response = await fetch(`/api/domains?domainName=${domainToCheck}`)
            const result = await response.json()

            if (result.success && result.data) {
                // Only use the config if it's active
                if (result.data.isActive) {
                    console.log('✅ Domain configuration found and active:', result.data.domainName)
                    setDomainConfig(result.data)
                } else {
                    console.warn('⚠️ Domain found but not active:', result.data.domainName)
                    setDomainConfig(null)
                }
            } else {
                console.warn('❌ No domain configuration found for:', domainToCheck)
                setDomainConfig(null)
            }
        } catch (err) {
            console.error('Failed to fetch domain config:', err)
            setError('Failed to load domain configuration')
            setDomainConfig(null)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchDomainConfig()
    }, [fetchDomainConfig])

    return (
        <DomainContext.Provider value={{
            domainConfig,
            loading,
            error,
            refreshDomainConfig: fetchDomainConfig
        }}>
            {children}
        </DomainContext.Provider>
    )
}

export default DomainContext
