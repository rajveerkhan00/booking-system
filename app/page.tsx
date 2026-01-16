"use client"

import { useState, useCallback, useEffect } from "react"
import Skeleton from "./components/Skeleton"
import AirportTransfersForm from "./components/airport-transfers-form"
import CarRentalsForm from "./components/car-rentals-form"
import { BookingForm } from "./components/booking-form"
import { TransferBookingForm } from "./components/transfer-booking-form"
import { Plane, Car, Shield, Zap, BadgeCheck, ArrowLeft, Globe, Search } from "lucide-react"
import { useTheme } from "./context/ThemeContext"
import { useDomain } from "./context/DomainContext"
import Link from "next/link"
import ManageBookingModal from "./components/ManageBookingModal"

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
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>("transfers")
  const [viewMode, setViewMode] = useState<ViewMode>("search")
  const [searchData, setSearchData] = useState<SearchData | null>(null)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isFormLoading, setIsFormLoading] = useState(false)
  const [showManageBooking, setShowManageBooking] = useState(false)

  const { theme, loading: themeLoading } = useTheme()
  const { domainConfig, loading: domainLoading } = useDomain()
  const [minDelayPassed, setMinDelayPassed] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setMinDelayPassed(true), 1000)
    return () => clearTimeout(timer)
  }, [])

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
    background: '#000000'
  }

  if (!domainLoading && !domainConfig) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black p-4">
        <div className="text-center max-w-md animate-fade-in">
          <div className="w-24 h-24 bg-gray-800 rounded-3xl flex items-center justify-center mx-auto mb-6 border-2 border-dashed border-gray-700">
            <Globe className="w-12 h-12 text-gray-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">No Data Available</h1>
          <p className="text-gray-400 text-lg leading-relaxed">
            This domain (<span className="font-semibold text-gray-300">{typeof window !== 'undefined' ? window.location.hostname : ''}</span>) has not been configured in our system yet.
          </p>
          <div className="mt-8">
            <Link href="/" className="text-teal-400 font-semibold hover:underline">
              Go back home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={pageStyle}
    >

      {showSkeleton ? (
        <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
          <div className="w-full max-w-4xl">
            {/* Header Skeleton */}
            <div className="text-center mb-10 flex flex-col items-center">
              <Skeleton className="w-20 h-20 rounded-2xl mb-4" /> {/* Logo */}
              <Skeleton className="w-64 h-10 rounded-lg mb-3" /> {/* Title */}
              <Skeleton className="w-80 h-6 rounded-lg" /> {/* Subtitle */}
            </div>

            {/* Tab Skeleton */}
            <div className="flex mb-1">
              <div className="flex items-center gap-3 px-6 py-4 rounded-t-2xl bg-gray-50 border-b-0">
                <Skeleton className="w-4 h-4 rounded" />
                <Skeleton className="w-32 h-5 rounded" />
              </div>
              <div className="flex items-center gap-3 px-6 py-4 rounded-t-2xl opacity-50">
                <Skeleton className="w-4 h-4 rounded" />
                <Skeleton className="w-24 h-5 rounded" />
              </div>
            </div>

            {/* Form Skeleton */}
            <div className="bg-white border-2 border-gray-100 p-8 rounded-2xl rounded-tl-none shadow-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Inputs Row 1: From, To, Date */}
                <div className="space-y-2">
                  <Skeleton className="w-20 h-4 rounded" />
                  <Skeleton className="w-full h-12 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="w-20 h-4 rounded" />
                  <Skeleton className="w-full h-12 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="w-20 h-4 rounded" />
                  <Skeleton className="w-full h-12 rounded-xl" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Inputs Row 2: Time, Passengers */}
                <div className="space-y-2">
                  <Skeleton className="w-20 h-4 rounded" />
                  <Skeleton className="w-full h-12 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="w-20 h-4 rounded" />
                  <Skeleton className="w-full h-12 rounded-xl" />
                </div>
              </div>

              {/* Button */}
              <div className="flex justify-center mt-8">
                <Skeleton className="h-14 w-full md:w-96 rounded-xl" />
              </div>
            </div>

            {/* Trust Badges Skeleton */}
            <div className="flex flex-wrap justify-center gap-6 md:gap-10 mt-10">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 px-5 py-3 rounded-2xl border border-gray-100 bg-white shadow-sm">
                  <Skeleton className="w-10 h-10 rounded-xl" />
                  <Skeleton className="w-32 h-4 rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : viewMode === "search" ? (
        <div className={`relative z-10 flex items-center justify-center min-h-screen p-4 ${isTransitioning ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}>
          <div className="w-full max-w-4xl animate-fade-in">
            {/* Logo/Header */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-md rounded-2xl mb-4 shadow-lg border border-white/20">
                <Plane className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 drop-shadow-lg">
                Travel Booking
              </h1>
              <p className="text-white/90 text-lg font-medium mb-6">
                Airport transfers and car rentals made easy
              </p>

              <button
                onClick={() => setShowManageBooking(true)}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-xl text-white font-bold transition-all hover:scale-105 active:scale-95 group shadow-lg"
              >
                <Search className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                Manage My Booking
              </button>
            </div>

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
                    <div className="space-y-2">
                      <Skeleton className="w-20 h-4 rounded bg-white/20" />
                      <Skeleton className="w-full h-12 rounded-xl bg-white/20" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="w-20 h-4 rounded bg-white/20" />
                      <Skeleton className="w-full h-12 rounded-xl bg-white/20" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="w-20 h-4 rounded bg-white/20" />
                      <Skeleton className="w-full h-12 rounded-xl bg-white/20" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Skeleton className="w-20 h-4 rounded bg-white/20" />
                      <Skeleton className="w-full h-12 rounded-xl bg-white/20" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="w-20 h-4 rounded bg-white/20" />
                      <Skeleton className="w-full h-12 rounded-xl bg-white/20" />
                    </div>
                  </div>
                  <div className="flex justify-center mt-8">
                    <Skeleton className="h-14 w-full md:w-96 rounded-xl bg-white/20" />
                  </div>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mt-10 animate-fade-in stagger-3">
              <div className="flex items-center gap-3 text-white/95 bg-white/10 backdrop-blur-md px-5 py-4 rounded-2xl border border-white/20 shadow-lg">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Shield className="w-5 h-5" />
                </div>
                <span className="text-sm font-semibold">Secure Booking</span>
              </div>
              <div className="flex items-center gap-3 text-white/95 bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/20">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Zap className="w-5 h-5" />
                </div>
                <span className="text-sm font-semibold">Instant Confirmation</span>
              </div>
              <div className="flex items-center gap-3 text-white/95 bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/20">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <BadgeCheck className="w-5 h-5" />
                </div>
                <span className="text-sm font-semibold">Best Price Guarantee</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className={`relative z-10 min-h-screen bg-black transition-opacity duration-300`}>
          {/* Header for booking flow - white background with accent colors */}
          <div
            className="py-4 px-4 shadow-md sticky top-0 z-50 border-b bg-black"
            style={theme ? {
              borderColor: `${theme.primaryColor}30`
            } : { borderColor: '#14b8a630' }}
          >
            <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                onClick={handleBackToSearch}
                className="w-full sm:w-auto flex items-center justify-center gap-2 text-gray-700 hover:text-gray-900 transition-all font-semibold group bg-gray-100 hover:bg-gray-200 px-4 py-2.5 rounded-xl border border-gray-200"
              >
                <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" />
                New Search
              </button>
              <h1 className="text-lg font-bold text-gray-100 flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                  style={theme ? {
                    background: `linear-gradient(to bottom right, ${theme.primaryColor}, ${theme.primaryDark})`
                  } : { background: 'linear-gradient(to bottom right, #0d9488, #0f766e)' }}
                >
                  {searchData?.mode === "transfer" ? <Plane className="w-5 h-5" /> : <Car className="w-5 h-5" />}
                </div>
                {searchData?.mode === "transfer" ? "Airport Transfer" : "Car Rental"} <span className="hidden xs:inline">Booking</span>
              </h1>
              <div className="hidden sm:block w-32" /> {/* Spacer for centering */}
            </div>
          </div>

          {/* Booking Form - Different form based on mode */}
          <div className="py-8 px-4 bg-gray-50 min-h-[calc(100vh-80px)]">
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

