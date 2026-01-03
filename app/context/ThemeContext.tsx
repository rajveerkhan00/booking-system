'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { ThemeDefinition, DEFAULT_THEME_ID, getDefaultTheme, getThemeById } from '@/lib/themes'
import { useDomain } from './DomainContext'

// Extend ThemeDefinition to include frontend-specific props if needed (like _id alias)
export type ThemeData = ThemeDefinition & {
    _id: string;
    isActive?: boolean;
}

interface ThemeContextType {
    theme: ThemeData | null
    loading: boolean
    error: string | null
    refreshTheme: () => Promise<void>
    setActiveTheme: (themeId: string) => Promise<boolean>
    domainLoading?: boolean
}

const defaultContextTheme: ThemeData = {
    ...getDefaultTheme(),
    _id: getDefaultTheme().id,
    isActive: true
}

const ThemeContext = createContext<ThemeContextType>({
    theme: defaultContextTheme,
    loading: false,
    error: null,
    refreshTheme: async () => { },
    setActiveTheme: async () => false
})

export const useTheme = () => useContext(ThemeContext)

export const ThemeContextProvider = ({ children }: { children: ReactNode }) => {
    const [theme, setTheme] = useState<ThemeData>(defaultContextTheme)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const { domainConfig, loading: domainLoading } = useDomain()

    const applyTheme = useCallback((themeData: ThemeData) => {
        const root = document.documentElement

        // Primary colors
        root.style.setProperty('--primary', themeData.primaryColor)
        root.style.setProperty('--primary-rgb', themeData.primaryColorRgb)
        root.style.setProperty('--primary-dark', themeData.primaryDark)
        root.style.setProperty('--primary-dark-rgb', themeData.primaryDarkRgb)

        // Secondary colors
        root.style.setProperty('--secondary', themeData.secondaryColor)
        root.style.setProperty('--secondary-rgb', themeData.secondaryColorRgb)
        root.style.setProperty('--secondary-dark', themeData.secondaryDark)
        root.style.setProperty('--secondary-dark-rgb', themeData.secondaryDarkRgb)

        // Background colors
        root.style.setProperty('--background-start', themeData.backgroundStart)
        root.style.setProperty('--background-middle', themeData.backgroundMiddle)
        root.style.setProperty('--background-end', themeData.backgroundEnd)

        // Text colors
        root.style.setProperty('--text-primary', themeData.textPrimary)
        root.style.setProperty('--text-secondary', themeData.textSecondary)
        root.style.setProperty('--text-muted', themeData.textMuted)

        // Accent colors
        root.style.setProperty('--accent', themeData.accentColor)
        root.style.setProperty('--accent-rgb', themeData.accentColorRgb)
        root.style.setProperty('--success', themeData.successColor)
        root.style.setProperty('--success-rgb', themeData.successColorRgb)
        root.style.setProperty('--warning', themeData.warningColor)
        root.style.setProperty('--warning-rgb', themeData.warningColorRgb)

        // Card styles
        root.style.setProperty('--card-background', themeData.cardBackground)
        root.style.setProperty('--card-border', themeData.cardBorder)
        root.style.setProperty('--card-shadow', themeData.cardShadow)

        // Other styles
        root.style.setProperty('--button-gradient-direction', themeData.buttonGradientDirection)
        root.style.setProperty('--glass-opacity', themeData.glassOpacity.toString())
        root.style.setProperty('--glass-blur', `${themeData.glassBlur}px`)
        root.style.setProperty('--border-radius', themeData.borderRadius)
        root.style.setProperty('--font-family', themeData.fontFamily)
    }, [])

    const fetchActiveTheme = useCallback(async () => {
        // Wait for domain config to load first if it's still loading
        if (domainLoading) return;

        try {
            setLoading(true)
            setError(null)

            // Priority:
            // 1. Theme from Domain Config
            // 2. Global Active Theme
            // 3. Default Theme

            let url = '/api/themes/active'
            if (domainConfig?.themeId) {
                url = `/api/themes/${domainConfig.themeId}`
            }

            const response = await fetch(url)
            const result = await response.json()

            if (result.success && result.data) {
                setTheme(result.data)
                applyTheme(result.data)
            } else {
                // Use default theme
                setTheme(defaultContextTheme)
                applyTheme(defaultContextTheme)
            }
        } catch (err) {
            console.error('Failed to fetch active theme:', err)
            setError('Failed to load theme')
            setTheme(defaultContextTheme)
            applyTheme(defaultContextTheme)
        } finally {
            setLoading(false)
        }
    }, [applyTheme, domainConfig, domainLoading])

    const setActiveTheme = async (themeId: string) => {
        try {
            const response = await fetch(`/api/themes/${themeId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: true })
            })
            const result = await response.json()
            if (result.success) {
                await fetchActiveTheme()
                return true
            }
            return false
        } catch (err) {
            console.error('Failed to set active theme:', err)
            return false
        }
    }

    useEffect(() => {
        fetchActiveTheme()
    }, [fetchActiveTheme])

    return (
        <ThemeContext.Provider value={{
            theme,
            loading,
            error,
            refreshTheme: fetchActiveTheme,
            setActiveTheme,
            domainLoading // Expose if needed
        }}>
            {children}
        </ThemeContext.Provider>
    )
}


export default ThemeContext
