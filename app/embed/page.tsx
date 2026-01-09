"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import Skeleton from "../components/Skeleton"
import AirportTransfersForm from "../components/airport-transfers-form"
import CarRentalsForm from "../components/car-rentals-form"
import { BookingForm } from "../components/booking-form"
import { TransferBookingForm } from "../components/transfer-booking-form"
import { Plane, Car, Shield, Zap, BadgeCheck, ArrowLeft, Globe, Search } from "lucide-react"
import { useTheme } from "../context/ThemeContext"
import { useDomain } from "../context/DomainContext"
import Link from "next/link"
import ManageBookingModal from "../components/ManageBookingModal"

type TabType = "transfers" | "rentals"
type ViewMode = "search" | "booking"

interface SearchData {
    pickupLocation: string
    dropoffLocation: string
    pickupDate: string
    pickupTime: string
    returnDate?: string
    returnTime?: string
    passengers?: string
    mode: "transfer" | "rental"
    estimatedDistance?: string
    estimatedDuration?: string
    pickupCoords?: { lat: number; lon: number }
    dropoffCoords?: { lat: number; lon: number }
}

export default function EmbedPage() {
    const [activeTab, setActiveTab] = useState<TabType>("transfers")
    const [viewMode, setViewMode] = useState<ViewMode>("search")
    const [searchData, setSearchData] = useState<SearchData | null>(null)
    const [isTransitioning, setIsTransitioning] = useState(false)
    const [isFormLoading, setIsFormLoading] = useState(false)
    const [showManageBooking, setShowManageBooking] = useState(false)

    const { theme, loading: themeLoading } = useTheme()
    const { domainConfig, loading: domainLoading } = useDomain()
    const [minDelayPassed, setMinDelayPassed] = useState(false)
    const [embedParams, setEmbedParams] = useState({ hideBg: false, hideHeader: false })
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const timer = setTimeout(() => setMinDelayPassed(true), 1000)

        // Parse embed-specific params
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search)
            setEmbedParams({
                hideBg: params.get('hide-bg') === 'true',
                hideHeader: params.get('hide-header') === 'true'
            })
        }

        return () => clearTimeout(timer)
    }, [])

    // Auto-resize logic
    useEffect(() => {
        if (!containerRef.current) return

        const resizeObserver = new ResizeObserver(() => {
            if (containerRef.current) {
                // Use scrollHeight to get the actual content height
                // This is more reliable than contentRect in an iframe context
                const height = containerRef.current.scrollHeight
                window.parent.postMessage({ type: 'resize', height: height }, '*')
            }
        })

        resizeObserver.observe(containerRef.current)
        return () => resizeObserver.disconnect()
    }, [viewMode, activeTab, isFormLoading])

    const showSkeleton = themeLoading || domainLoading || !minDelayPassed

    const handleSearch = useCallback((data: SearchData) => {
        setIsTransitioning(true)
        setSearchData(data)

        // Smooth transition to booking view
        setTimeout(() => {
            setViewMode("booking")
            setIsTransitioning(false)
        }, 300)
    }, [])

    const handleBackToSearch = useCallback(() => {
        setIsTransitioning(true)
        setTimeout(() => {
            setViewMode("search")
            setIsTransitioning(false)
        }, 300)
    }, [])

    // Listen for formData URL parameter and auto-trigger search
    useEffect(() => {
        if (typeof window === 'undefined') return

        const params = new URLSearchParams(window.location.search)
        const formDataParam = params.get('formData')

        if (formDataParam) {
            try {
                console.log('📩 Received formData in iframe')
                const decoded = decodeURIComponent(formDataParam)
                const data = JSON.parse(decoded)
                console.log('✅ Parsed data:', data)

                // Set the correct tab based on service type
                if (data.serviceType === 'airport-transfers') {
                    setActiveTab('transfers')
                } else if (data.serviceType === 'car-rentals') {
                    setActiveTab('rentals')
                }

                // Transform the data to match SearchData interface
                const searchData: SearchData = {
                    pickupLocation: data.pickupLocation || '',
                    dropoffLocation: data.dropoffLocation || '',
                    pickupDate: data.pickupDate || '',
                    pickupTime: data.pickupTime || '',
                    returnDate: data.returnDate,
                    returnTime: data.returnTime,
                    passengers: data.passengers || '1',
                    mode: data.mode || 'transfer',
                    estimatedDistance: data.estimatedDistance,
                    estimatedDuration: data.estimatedDuration,
                    pickupCoords: data.pickupCoords,
                    dropoffCoords: data.dropoffCoords
                }

                console.log('🎯 Auto-triggering search with data:', searchData)

                // Automatically trigger the search after a short delay to ensure the form is loaded
                setTimeout(() => {
                    handleSearch(searchData)
                }, 1500)

            } catch (error) {
                console.error('❌ Error parsing formData:', error)
            }
        }
    }, [handleSearch])

    const handleTabChange = (tab: TabType) => {
        if (tab !== activeTab) {
            setIsFormLoading(true)
            setTimeout(() => {
                setActiveTab(tab)
                setIsFormLoading(false)
            }, 500)
        }
    }

    // Fixed black background - themes control only accent colors
    const pageStyle = {
        background: embedParams.hideBg ? 'transparent' : '#000000'
    }

    if (!domainLoading && !domainConfig) {
        return (
            <div className={`py-12 flex items-center justify-center ${embedParams.hideBg ? '' : 'bg-black'} p-4`}>
                <div className="text-center max-w-md animate-fade-in">
                    <div className="w-24 h-24 bg-gray-800 rounded-3xl flex items-center justify-center mx-auto mb-6 border-2 border-dashed border-gray-700">
                        <Globe className="w-12 h-12 text-gray-400" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-3">Service Unavailable</h1>
                    <p className="text-gray-400 text-lg leading-relaxed">
                        This booking form is not configured for this domain. Please contact support.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div
            ref={containerRef}
            className="relative overflow-hidden w-full"
            style={pageStyle}
        >

            {showSkeleton ? (
                <div className="relative z-10 flex items-center justify-center py-4 px-4">
                    <div className="w-full max-w-4xl">
                        {/* Form Skeleton */}
                        <div className="bg-white border-2 border-gray-100 p-8 rounded-2xl shadow-lg">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                <Skeleton className="w-full h-12 rounded-xl" />
                                <Skeleton className="w-full h-12 rounded-xl" />
                                <Skeleton className="w-full h-12 rounded-xl" />
                            </div>
                            <Skeleton className="h-14 w-full rounded-xl" />
                        </div>
                    </div>
                </div>
            ) : viewMode === "search" ? (
                <div className={`relative z-10 flex items-center justify-center py-1 px-4 ${isTransitioning ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}>
                    <div className="w-full max-w-4xl animate-fade-in">
                        {/* Logo/Header (Optional in embed) */}
                        {!embedParams.hideHeader && (
                            <div className="mb-3">
                                <div className="flex justify-start">
                                    <button
                                        onClick={() => setShowManageBooking(true)}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-lg text-white text-sm font-semibold transition-all hover:scale-105 active:scale-95 shadow-lg"
                                    >
                                        <Search className="w-4 h-4" />
                                        Manage Booking
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Tab Headers */}
                        <div className="flex flex-col sm:flex-row mb-1 gap-1 sm:gap-0">
                            <button
                                onClick={() => handleTabChange("transfers")}
                                className={`flex items-center gap-3 px-6 py-4 text-base font-semibold transition-all duration-300 rounded-2xl sm:rounded-none sm:rounded-t-2xl ${activeTab === "transfers"
                                    ? "bg-white text-gray-800 shadow-lg"
                                    : "bg-white/20 text-white hover:bg-white/30 backdrop-blur-md"
                                    }`}
                            >
                                <div
                                    className={`w-9 h-9 rounded-xl flex items-center justify-center`}
                                    style={activeTab === "transfers" ? {
                                        background: theme ? `linear-gradient(to bottom right, ${theme.primaryColor}, ${theme.primaryDark})` : 'linear-gradient(to bottom right, #0d9488, #0f766e)'
                                    } : { backgroundColor: 'rgba(255,255,255,0.2)' }}
                                >
                                    <Plane className={`w-4 h-4 ${activeTab === "transfers" ? "text-white" : ""}`} />
                                </div>
                                Airport Transfers
                            </button>
                            <button
                                onClick={() => handleTabChange("rentals")}
                                className={`flex items-center gap-3 px-6 py-4 text-base font-semibold transition-all duration-300 rounded-2xl sm:rounded-none sm:rounded-t-2xl ${activeTab === "rentals"
                                    ? "bg-white text-gray-800 shadow-lg"
                                    : "bg-white/20 text-white hover:bg-white/30 backdrop-blur-md"
                                    }`}
                            >
                                <div
                                    className={`w-9 h-9 rounded-xl flex items-center justify-center`}
                                    style={activeTab === "rentals" ? {
                                        background: theme ? `linear-gradient(to bottom right, ${theme.secondaryColor}, ${theme.secondaryDark})` : 'linear-gradient(to bottom right, #3b82f6, #2563eb)'
                                    } : { backgroundColor: 'rgba(255,255,255,0.2)' }}
                                >
                                    <Car className={`w-4 h-4 ${activeTab === "rentals" ? "text-white" : ""}`} />
                                </div>
                                Car Rentals
                            </button>
                        </div>

                        {/* Form Container */}
                        <div className="glass-card-elevated p-5 md:p-8 rounded-2xl sm:rounded-tl-none min-h-[280px]">
                            {isFormLoading ? (
                                <div className="animate-pulse space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <Skeleton className="w-full h-12 rounded-xl bg-white/20" />
                                        <Skeleton className="w-full h-12 rounded-xl bg-white/20" />
                                        <Skeleton className="w-full h-12 rounded-xl bg-white/20" />
                                    </div>
                                    <Skeleton className="h-14 w-full rounded-xl bg-white/20" />
                                </div>
                            ) : (
                                <div className="animate-fade-in">
                                    {activeTab === "transfers" && (
                                        <AirportTransfersForm onSearch={handleSearch} />
                                    )}
                                    {activeTab === "rentals" && (
                                        <CarRentalsForm onSearch={handleSearch} />
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Trust badges */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 animate-fade-in">
                            <div className="flex items-center gap-3 text-white/95 bg-white/10 backdrop-blur-md px-4 py-3 rounded-xl border border-white/20">
                                <Shield className="w-4 h-4" />
                                <span className="text-xs font-semibold">Secure Booking</span>
                            </div>
                            <div className="flex items-center gap-3 text-white/95 bg-white/10 backdrop-blur-md px-4 py-3 rounded-xl border border-white/20">
                                <Zap className="w-4 h-4" />
                                <span className="text-xs font-semibold">Instant Confirmation</span>
                            </div>
                            <div className="flex items-center gap-3 text-white/95 bg-white/10 backdrop-blur-md px-4 py-3 rounded-xl border border-white/20">
                                <BadgeCheck className="w-4 h-4" />
                                <span className="text-xs font-semibold">Best Price</span>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className={`relative z-10 bg-white ${isTransitioning ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}>
                    {/* Header for booking flow - white background */}
                    <div
                        className="py-4 px-4 shadow-md sticky top-0 z-50 border-b bg-white"
                        style={theme ? {
                            borderColor: `${theme.primaryColor}30`
                        } : { borderColor: '#14b8a630' }}
                    >
                        <div className="max-w-6xl mx-auto flex items-center justify-between">
                            <button
                                onClick={handleBackToSearch}
                                className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-all font-semibold group bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg border border-gray-200"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back
                            </button>
                            <h1 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <div
                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                                    style={theme ? {
                                        background: `linear-gradient(to bottom right, ${theme.primaryColor}, ${theme.primaryDark})`
                                    } : { background: 'linear-gradient(to bottom right, #0d9488, #0f766e)' }}
                                >
                                    {searchData?.mode === "transfer" ? <Plane className="w-4 h-4" /> : <Car className="w-4 h-4" />}
                                </div>
                                {searchData?.mode === "transfer" ? "Transfer" : "Rental"} Booking
                            </h1>
                            <div className="w-20" />
                        </div>
                    </div>

                    {/* Booking Form */}
                    <div className="py-6 px-4 bg-gray-50">
                        {searchData?.mode === "transfer" ? (
                            <TransferBookingForm
                                initialData={searchData}
                                onBack={handleBackToSearch}
                                isLoading={isTransitioning}
                            />
                        ) : (
                            <BookingForm
                                initialData={searchData}
                                onBack={handleBackToSearch}
                                isLoading={isTransitioning}
                            />
                        )}
                    </div>
                </div>
            )}
            <ManageBookingModal
                isOpen={showManageBooking}
                onClose={() => setShowManageBooking(false)}
            />
        </div>
    )
}
