"use client"

import { useState, useCallback, useEffect } from "react"
import { SearchResults } from "./steps/search-results"
import { OptionsStep } from "./steps/options-step"
import { DetailsStep } from "./steps/details-step"
import { ConfirmationStep } from "./steps/confirmation-step"
import { ProgressBar } from "./progress-bar"
import { ArrowLeft } from "lucide-react"
import { getExchangeRates } from "@/lib/currency"
import { useGeolocation } from "@/app/context/GeolocationContext"

export type BookingStep = "search" | "options" | "details" | "confirmation"

export interface SelectedCar {
  id: string
  name: string
  category: string
  image: string
  seats: number
  bags: number
  transmission: string
  price: number
  description: string
  fuelType: string
  pickupLocation: string
  features: string[]
}

export interface BookingData {
  pickupLocation: string
  dropoffLocation: string
  pickupDate: string
  pickupTime: string
  dropoffDate: string
  dropoffTime: string
  currency: string
  selectedCar: SelectedCar | null
  extras: {
    additionalDriver: number
    childSeat: number
    boosterSeat: number
  }
  driverDetails: {
    firstName: string
    lastName: string
    email: string
    phone: string
    licensNumber: string
  }
  rentalAgreement: boolean
  insuranceOption: string
}

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

interface BookingFormProps {
  initialData?: SearchData | null
  onBack?: () => void
  isLoading?: boolean
}

export function BookingForm({ initialData, onBack, isLoading = false }: BookingFormProps) {
  const [currentStep, setCurrentStep] = useState<BookingStep>("search")
  const [previousStep, setPreviousStep] = useState<BookingStep | null>(null)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [transitionDirection, setTransitionDirection] = useState<'forward' | 'backward'>('forward')
  const [exchangeRates, setExchangeRates] = useState<any>(null)
  const [loadingRates, setLoadingRates] = useState(false)
  const [bookingReference, setBookingReference] = useState<string | null>(null)

  // Get auto-detected currency from geolocation
  const { detectedCurrency, loading: geoLoading } = useGeolocation()

  const [bookingData, setBookingData] = useState<BookingData>({
    pickupLocation: initialData?.pickupLocation || "Karachi Jinnah International Airport",
    dropoffLocation: initialData?.dropoffLocation || "Karachi Jinnah International Airport",
    pickupDate: initialData?.pickupDate || "2026-02-23",
    pickupTime: initialData?.pickupTime || "10:00",
    dropoffDate: initialData?.returnDate || "2026-02-27",
    dropoffTime: initialData?.returnTime || "10:00",
    currency: "USD", // Will be updated by geolocation
    selectedCar: null,
    extras: {
      additionalDriver: 0,
      childSeat: 0,
      boosterSeat: 0,
    },
    driverDetails: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      licensNumber: "",
    },
    rentalAgreement: false,
    insuranceOption: "standard",
  })

  // Update currency when geolocation detects it
  useEffect(() => {
    if (!geoLoading && detectedCurrency) {
      setBookingData(prev => ({
        ...prev,
        currency: detectedCurrency
      }))
      console.log(`💰 Currency auto-set to ${detectedCurrency} based on user location`)
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

  // Update booking data when initial data changes
  useEffect(() => {
    if (initialData) {
      setBookingData(prev => ({
        ...prev,
        pickupLocation: initialData.pickupLocation,
        dropoffLocation: initialData.dropoffLocation,
        pickupDate: initialData.pickupDate,
        pickupTime: initialData.pickupTime,
        dropoffDate: initialData.returnDate || prev.dropoffDate,
        dropoffTime: initialData.returnTime || prev.dropoffTime,
      }))
    }
  }, [initialData])

  const stepOrder: BookingStep[] = ["search", "options", "details", "confirmation"]

  const handleSelectCar = useCallback((car: SelectedCar) => {
    setBookingData((prev) => ({ ...prev, selectedCar: car }))
    navigateToStep("options", "forward")
  }, [])

  const handleUpdateExtras = useCallback((extras: BookingData["extras"]) => {
    setBookingData((prev) => ({ ...prev, extras }))
  }, [])

  const handleUpdateDriverDetails = useCallback((details: BookingData["driverDetails"]) => {
    setBookingData((prev) => ({ ...prev, driverDetails: details }))
  }, [])

  const navigateToStep = useCallback((step: BookingStep, direction: 'forward' | 'backward') => {
    setIsTransitioning(true)
    setTransitionDirection(direction)
    setPreviousStep(currentStep)

    setTimeout(() => {
      setCurrentStep(step)
      setIsTransitioning(false)
      // Scroll to top of booking section
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }, 300)
  }, [currentStep])

  const handleNextStep = useCallback((step: BookingStep) => {
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

  const handleStepClick = useCallback((step: BookingStep) => {
    const currentIndex = stepOrder.indexOf(currentStep)
    const targetIndex = stepOrder.indexOf(step)

    // Only allow going back, not forward (unless conditions are met)
    if (targetIndex < currentIndex) {
      navigateToStep(step, "backward")
    } else if (targetIndex === currentIndex + 1) {
      // Allow going to next step only if current step requirements are met
      if (step === "options" && bookingData.selectedCar) {
        navigateToStep(step, "forward")
      } else if (step === "details" && bookingData.selectedCar) {
        navigateToStep(step, "forward")
      } else if (step === "confirmation" && bookingData.driverDetails.firstName) {
        navigateToStep(step, "forward")
      }
    }
  }, [currentStep, bookingData, navigateToStep])

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleConfirm = useCallback(async () => {
    if (!bookingData.selectedCar) return

    setIsSubmitting(true)

    try {
      // Calculate total price
      const carPrice = bookingData.selectedCar.price
      const extrasTotal =
        (bookingData.extras.additionalDriver * 2806.91) +
        (bookingData.extras.childSeat * 2806.91) +
        (bookingData.extras.boosterSeat * 2806.91)
      const totalPrice = carPrice + extrasTotal

      const payload = {
        bookingType: 'rental',
        fromLocation: bookingData.pickupLocation,
        toLocation: bookingData.dropoffLocation,
        date: bookingData.pickupDate,
        pickupTime: bookingData.pickupTime,
        dropoffDate: bookingData.dropoffDate,
        dropoffTime: bookingData.dropoffTime,
        currency: bookingData.currency,
        totalPrice: totalPrice,

        selectedVehicle: {
          id: bookingData.selectedCar.id,
          name: bookingData.selectedCar.name,
          type: bookingData.selectedCar.category, // Map category to type
          image: bookingData.selectedCar.image,
          price: bookingData.selectedCar.price
        },

        // Driver details mapped to passenger fields for consistency
        passengerName: `${bookingData.driverDetails.firstName} ${bookingData.driverDetails.lastName}`,
        email: bookingData.driverDetails.email,
        phone: bookingData.driverDetails.phone,
        licenseNumber: bookingData.driverDetails.licensNumber, // Note: fixing typo in state if possible, but mapping here

        rentalExtras: bookingData.extras,

        status: 'pending'
      }

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Booking failed')
      }

      setBookingReference(result.bookingReference)
      console.log("Booking confirmed:", result)
      // alert("🎉 Booking Confirmed! Check your email for confirmation details.")

      // Optional: Redirect or reset form

    } catch (error) {
      console.error("Error submitting booking:", error)
      alert("Something went wrong with your booking. Please try again.")
      throw error // Re-throw so ConfirmationStep knows it failed
    } finally {
      setIsSubmitting(false)
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
      <ProgressBar
        currentStep={currentStep}
        onStepClick={handleStepClick}
        completedSteps={{
          search: !!bookingData.selectedCar,
          options: currentStep !== 'search' && currentStep !== 'options',
          details: currentStep === 'confirmation',
          confirmation: false
        }}
      />

      <div className="mt-8">
        {/* Back button for booking steps */}
        {currentStep !== 'search' && (
          <button
            onClick={handlePreviousStep}
            className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-all font-medium group bg-white px-5 py-2.5 rounded-xl shadow-soft hover:shadow-medium border border-gray-100"
          >
            <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" />
            Back to {stepOrder[stepOrder.indexOf(currentStep) - 1]?.charAt(0).toUpperCase() + stepOrder[stepOrder.indexOf(currentStep) - 1]?.slice(1) || 'Search'}
          </button>
        )}

        <div className={`transition-all duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
          <div className={getTransitionClass()}>
            {currentStep === "search" && (
              <SearchResults
                onSelectCar={handleSelectCar}
                onUpdateCurrency={(currency: string) => setBookingData(prev => ({ ...prev, currency }))}
                bookingData={bookingData}
                isLoading={isLoading}
                initialExchangeRates={exchangeRates}
              />
            )}
            {currentStep === "options" && (
              <OptionsStep
                bookingData={bookingData}
                onUpdateExtras={handleUpdateExtras}
                onNext={() => handleNextStep("details")}
                onBack={handlePreviousStep}
                isLoading={isLoading}
                exchangeRates={exchangeRates}
              />
            )}
            {currentStep === "details" && (
              <DetailsStep
                bookingData={bookingData}
                onUpdateDetails={handleUpdateDriverDetails}
                onNext={() => handleNextStep("confirmation")}
                onBack={handlePreviousStep}
                isLoading={isLoading}
                exchangeRates={exchangeRates}
              />
            )}
            {currentStep === "confirmation" && (
              <ConfirmationStep
                bookingData={bookingData}
                onConfirm={handleConfirm}
                onBack={handlePreviousStep}
                isLoading={isLoading}
                exchangeRates={exchangeRates}
                bookingReference={bookingReference || undefined}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
