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

            // Check for domain override in URL query params
            const params = new URLSearchParams(window.location.search)
            const domainOverride = params.get('domain')
            const hostname = domainOverride || window.location.hostname

            // Helpful for local testing: localhost would likely not match any domain
            // In production, this will be the actual domain name.

            const response = await fetch(`/api/domains?domainName=${hostname}`)
            const result = await response.json()

            if (result.success && result.data) {
                // Only use the config if it's active
                if (result.data.isActive) {
                    setDomainConfig(result.data)
                } else {
                    setDomainConfig(null)
                }
            } else {
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
