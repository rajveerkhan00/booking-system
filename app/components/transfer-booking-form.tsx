"use client"

import { useState, useCallback, useEffect } from "react"
import { TransferSearchResults } from "./transfer-steps/transfer-search-results"
import { TransferDetailsStep } from "./transfer-steps/transfer-details-step"
import { TransferConfirmationStep } from "./transfer-steps/transfer-confirmation-step"
import { TransferProgressBar } from "./transfer-progress-bar"
import { getExchangeRates } from "@/lib/currency"
import { useGeolocation } from "@/app/context/GeolocationContext"

export type TransferStep = "search" | "details" | "confirmation"

export interface SelectedTransfer {
    id: string
    name: string
    type: string
    image: string
    passengers: number
    mediumLuggage: number
    smallLuggage: number
    price: number
    currency: string
    rating: number
    cancellationPolicy: string
}

export interface TransferBookingData {
    // Trip Info
    fromLocation: string
    toLocation: string
    date: string
    pickupTime: string
    passengers: number

    // Location coordinates for map
    fromCoords?: { lat: number; lon: number }
    toCoords?: { lat: number; lon: number }

    // Estimated
    estimatedTime: string
    estimatedDistance: string

    // Currency
    currency: string

    // Selected Vehicle
    selectedTransfer: SelectedTransfer | null

    // Transfer Details
    pickupAddress: string
    destinationAddress: string
    specialInstructions: string

    // Luggage
    smallLuggage: number
    mediumLuggage: number

    // Passenger Info
    passengerTitle: string
    passengerName: string
    email: string
    confirmEmail: string
    phone: string
    countryCode: string

    // Agreement
    termsAgreed: boolean
}

interface TransferSearchData {
    pickupLocation: string
    dropoffLocation: string
    pickupDate: string
    pickupTime: string
    passengers?: string
    mode: "transfer" | "rental"
}

interface TransferBookingFormProps {
    initialData?: TransferSearchData | null
    onBack?: () => void
    isLoading?: boolean
}

export function TransferBookingForm({ initialData, onBack, isLoading = false }: TransferBookingFormProps) {
    const [currentStep, setCurrentStep] = useState<TransferStep>("search")
    const [isTransitioning, setIsTransitioning] = useState(false)
    const [transitionDirection, setTransitionDirection] = useState<'forward' | 'backward'>('forward')
    const [exchangeRates, setExchangeRates] = useState<any>(null)
    const [loadingRates, setLoadingRates] = useState(false)
    const [bookingReference, setBookingReference] = useState<string | null>(null)

    // Get auto-detected currency from geolocation
    const { detectedCurrency, loading: geoLoading } = useGeolocation()

    const [bookingData, setBookingData] = useState<TransferBookingData>({
        fromLocation: initialData?.pickupLocation || "Karachi, Sindh, Pakistan",
        toLocation: initialData?.dropoffLocation || "Lahore, Punjab, Pakistan",
        date: initialData?.pickupDate || "2026-01-04",
        pickupTime: initialData?.pickupTime || "12:00",
        passengers: parseInt(initialData?.passengers || "2"),
        estimatedTime: "15 hours 19 mins",
        estimatedDistance: "1,211 km",
        currency: "USD", // Will be updated by geolocation
        selectedTransfer: null,
        pickupAddress: "",
        destinationAddress: "",
        specialInstructions: "",
        smallLuggage: 0,
        mediumLuggage: 0,
        passengerTitle: "",
        passengerName: "",
        email: "",
        confirmEmail: "",
        phone: "",
        countryCode: "+92",
        termsAgreed: false,
    })

    // Update currency when geolocation detects it
    useEffect(() => {
        if (!geoLoading && detectedCurrency) {
            setBookingData(prev => ({
                ...prev,
                currency: detectedCurrency
            }))
            console.log(`💰 Transfer form: Currency auto-set to ${detectedCurrency} based on user location`)
        }
    }, [detectedCurrency, geoLoading])

    // Fetch exchange rates
    useEffect(() => {
        const fetchRates = async () => {
            setLoadingRates(true)
            const rates = await getExchangeRates('USD')
            if (rates) {
                setExchangeRates(rates)
            }
            setLoadingRates(false)
        }
        fetchRates()
    }, [])

    useEffect(() => {
        if (initialData) {
            setBookingData(prev => ({
                ...prev,
                fromLocation: initialData.pickupLocation,
                toLocation: initialData.dropoffLocation,
                date: initialData.pickupDate,
                pickupTime: initialData.pickupTime,
                passengers: parseInt(initialData.passengers || "2"),
            }))
        }
    }, [initialData])

    const stepOrder: TransferStep[] = ["search", "details", "confirmation"]

    const navigateToStep = useCallback((step: TransferStep, direction: 'forward' | 'backward') => {
        setIsTransitioning(true)
        setTransitionDirection(direction)

        setTimeout(() => {
            setCurrentStep(step)
            setIsTransitioning(false)
            window.scrollTo({ top: 0, behavior: 'smooth' })
        }, 300)
    }, [])

    const handleSelectTransfer = useCallback((transfer: SelectedTransfer) => {
        setBookingData((prev) => ({ ...prev, selectedTransfer: transfer }))
        navigateToStep("details", "forward")
    }, [navigateToStep])

    const handleUpdateBookingData = useCallback((data: Partial<TransferBookingData>) => {
        setBookingData((prev) => ({ ...prev, ...data }))
    }, [])

    const handleNextStep = useCallback((step: TransferStep) => {
        navigateToStep(step, "forward")
    }, [navigateToStep])

    const handlePreviousStep = useCallback(() => {
        const currentIndex = stepOrder.indexOf(currentStep)
        if (currentIndex > 0) {
            navigateToStep(stepOrder[currentIndex - 1], "backward")
        } else if (onBack) {
            onBack()
        }
    }, [currentStep, navigateToStep, onBack])

    const handleStepClick = useCallback((step: TransferStep) => {
        const currentIndex = stepOrder.indexOf(currentStep)
        const targetIndex = stepOrder.indexOf(step)

        if (targetIndex < currentIndex) {
            navigateToStep(step, "backward")
        }
    }, [currentStep, navigateToStep])

    const handleEditQuote = useCallback(() => {
        if (onBack) {
            onBack()
        }
    }, [onBack])

    const handleConfirm = useCallback(async () => {
        try {
            const bookingPayload = {
                ...bookingData,
                selectedVehicle: bookingData.selectedTransfer, // Map to model expected field
                totalPrice: bookingData.selectedTransfer?.price || 0,
            }

            const response = await fetch('/api/bookings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(bookingPayload),
            })

            const result = await response.json()

            if (!response.ok) {
                console.error('Booking failed:', result.message)
                // You might want to show an error toast here
                throw new Error(result.message)
            }

            setBookingReference(result.bookingReference)
            console.log("Transfer booking confirmed and saved:", result)
        } catch (error) {
            console.error("Error submitting booking:", error)
            // Rethrow so the child component knows it failed
            throw error
        }
    }, [bookingData])

    const getTransitionClass = () => {
        if (!isTransitioning) {
            return transitionDirection === 'forward' ? 'animate-slide-in-right' : 'animate-slide-in-left'
        }
        return 'opacity-0 translate-x-4'
    }

    return (
        <div className="max-w-6xl mx-auto">
            <TransferProgressBar
                currentStep={currentStep}
                onStepClick={handleStepClick}
            />

            <div className="mt-8">
                <div className={`transition-all duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
                    <div className={getTransitionClass()}>
                        {currentStep === "search" && (
                            <TransferSearchResults
                                bookingData={bookingData}
                                onSelectTransfer={handleSelectTransfer}
                                onEditQuote={handleEditQuote}
                                onUpdateCurrency={(currency) => handleUpdateBookingData({ currency })}
                                isLoading={isLoading}
                                initialExchangeRates={exchangeRates}
                            />
                        )}
                        {currentStep === "details" && (
                            <TransferDetailsStep
                                bookingData={bookingData}
                                onUpdateData={handleUpdateBookingData}
                                onNext={() => handleNextStep("confirmation")}
                                onBack={handlePreviousStep}
                                onEditQuote={handleEditQuote}
                                isLoading={isLoading}
                                exchangeRates={exchangeRates}
                            />
                        )}
                        {currentStep === "confirmation" && (
                            <TransferConfirmationStep
                                bookingData={bookingData}
                                onUpdateData={handleUpdateBookingData}
                                onConfirm={handleConfirm}
                                onBack={handlePreviousStep}
                                onEditQuote={handleEditQuote}
                                isLoading={isLoading}
                                exchangeRates={exchangeRates}
                                bookingReference={bookingReference}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
