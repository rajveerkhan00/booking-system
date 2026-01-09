'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { getGeoLocation, GeoLocationData, validateLicense, getLicenseFormat, LicenseFormat } from '@/lib/geolocation'
import { ALL_CURRENCIES } from '@/lib/currency'

interface GeolocationContextType {
    geoData: GeoLocationData | null
    loading: boolean
    error: string | null
    detectedCurrency: string
    currencySymbol: string
    countryCode: string
    countryName: string
    licenseFormat: LicenseFormat
    validateLicenseNumber: (licenseNumber: string) => { isValid: boolean; errorMessage: string | null }
    refreshGeoLocation: () => Promise<void>
}

const defaultLicenseFormat: LicenseFormat = {
    minLength: 6,
    maxLength: 20,
    description: '6-20 characters',
    countryName: 'International'
}

const GeolocationContext = createContext<GeolocationContextType>({
    geoData: null,
    loading: true,
    error: null,
    detectedCurrency: 'USD',
    currencySymbol: '$',
    countryCode: 'US',
    countryName: 'United States',
    licenseFormat: defaultLicenseFormat,
    validateLicenseNumber: () => ({ isValid: true, errorMessage: null }),
    refreshGeoLocation: async () => { }
})

export const useGeolocation = () => useContext(GeolocationContext)

export const GeolocationProvider = ({ children }: { children: ReactNode }) => {
    const [geoData, setGeoData] = useState<GeoLocationData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [detectedCurrency, setDetectedCurrency] = useState('USD')
    const [currencySymbol, setCurrencySymbol] = useState('$')
    const [countryCode, setCountryCode] = useState('US')
    const [countryName, setCountryName] = useState('United States')
    const [licenseFormat, setLicenseFormat] = useState<LicenseFormat>(defaultLicenseFormat)

    const fetchGeoLocation = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)

            const data = await getGeoLocation()
            setGeoData(data)
            setDetectedCurrency(data.currency)
            setCountryCode(data.countryCode)
            setCountryName(data.countryName)

            // Get license format for this country
            const format = getLicenseFormat(data.countryCode)
            setLicenseFormat(format)

            // Find the currency symbol
            const currencyInfo = ALL_CURRENCIES.find(c => c.code === data.currency)
            if (currencyInfo) {
                setCurrencySymbol(currencyInfo.symbol)
            }

            console.log(`💰 Auto-detected currency: ${data.currency} (${currencyInfo?.symbol || '$'}) for ${data.countryName}`)
            console.log(`🪪 License format for ${data.countryName}: ${format.description}`)

        } catch (err) {
            console.error('Failed to fetch geolocation:', err)
            setError('Failed to detect location')
            // Default to USD on error
            setDetectedCurrency('USD')
            setCurrencySymbol('$')
            setCountryCode('US')
            setCountryName('United States')
        } finally {
            setLoading(false)
        }
    }, [])

    // Validate license number using detected country
    const validateLicenseNumber = useCallback((licenseNumber: string) => {
        return validateLicense(licenseNumber, countryCode)
    }, [countryCode])

    useEffect(() => {
        fetchGeoLocation()
    }, [fetchGeoLocation])

    return (
        <GeolocationContext.Provider value={{
            geoData,
            loading,
            error,
            detectedCurrency,
            currencySymbol,
            countryCode,
            countryName,
            licenseFormat,
            validateLicenseNumber,
            refreshGeoLocation: fetchGeoLocation
        }}>
            {children}
        </GeolocationContext.Provider>
    )
}

export default GeolocationContext

