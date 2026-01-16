"use client"

import type { BookingData } from "../booking-form"
import { useState, useMemo } from "react"
import Skeleton from "../Skeleton"
import {
  User,
  Mail,
  Phone,
  CreditCard,
  Check,
  ArrowLeft,
  ArrowRight,
  Lock,
  Loader2,
  ClipboardList,
  Wallet,
  MapPin,
  Flag,
  Shield,
  Zap,
  AlertCircle
} from "lucide-react"
import { convertPrice, ALL_CURRENCIES } from "@/lib/currency"
import { useGeolocation } from "@/app/context/GeolocationContext"

interface DetailsStepProps {
  bookingData: BookingData
  onUpdateDetails: (details: BookingData["driverDetails"]) => void
  onNext: () => void
  onBack?: () => void
  isLoading?: boolean
  exchangeRates?: any
}

export function DetailsStep({
  bookingData,
  onUpdateDetails,
  onNext,
  onBack,
  isLoading = false,
  exchangeRates
}: DetailsStepProps) {
  const [details, setDetails] = useState(bookingData.driverDetails)
  const [rentalAgreement, setRentalAgreement] = useState(bookingData.rentalAgreement)
  const [isProcessing, setIsProcessing] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const [licenseError, setLicenseError] = useState<string | null>(null)
  const [licenseTouched, setLicenseTouched] = useState(false)

  // Get geolocation context for license validation
  const { validateLicenseNumber, licenseFormat, countryName } = useGeolocation()

  const handleInputChange = (field: keyof typeof details, value: string) => {
    const newDetails = { ...details, [field]: value }
    setDetails(newDetails)
    onUpdateDetails(newDetails)

    // Validate license in real-time
    if (field === 'licensNumber') {
      if (value) {
        const validation = validateLicenseNumber(value)
        setLicenseError(validation.errorMessage)
      } else {
        setLicenseError(null)
      }
    }
  }

  const handleLicenseBlur = () => {
    setFocusedField(null)
    setLicenseTouched(true)
    // Validate on blur
    if (details.licensNumber) {
      const validation = validateLicenseNumber(details.licensNumber)
      setLicenseError(validation.errorMessage)
    }
  }

  // Check if license is valid
  const isLicenseValid = useMemo(() => {
    if (!details.licensNumber) return false
    const validation = validateLicenseNumber(details.licensNumber)
    return validation.isValid
  }, [details.licensNumber, validateLicenseNumber])

  const handleContinue = () => {
    if (!isFormValid) return
    setIsProcessing(true)
    setTimeout(() => {
      onNext()
      setIsProcessing(false)
    }, 300)
  }

  const isFormValid =
    details.firstName && details.lastName && details.email && details.phone && isLicenseValid && rentalAgreement

  const inputFields = [
    { key: 'firstName' as const, label: 'First Name', type: 'text', placeholder: 'Enter your first name', icon: User, half: true },
    { key: 'lastName' as const, label: 'Last Name', type: 'text', placeholder: 'Enter your last name', icon: User, half: true },
    { key: 'email' as const, label: 'Email Address', type: 'email', placeholder: 'your.email@example.com', icon: Mail, half: false },
    { key: 'phone' as const, label: 'Phone Number', type: 'tel', placeholder: '+92 XXX XXXXXXX', icon: Phone, half: false },
    { key: 'licensNumber' as const, label: 'Driving License Number', type: 'text', placeholder: `Enter your license number (${licenseFormat.description})`, icon: CreditCard, half: false },
  ]

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse">
        <div className="lg:col-span-2">
          <div className="bg-white border border-gray-100 rounded-2xl p-8 space-y-6 shadow-sm">
            <Skeleton className="h-10 w-1/3 rounded mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className={i > 2 ? 'md:col-span-2' : ''}>
                  <Skeleton className="h-4 w-24 rounded mb-2" />
                  <Skeleton className="h-12 w-full rounded-xl" />
                </div>
              ))}
            </div>
            <Skeleton className="h-20 w-full rounded-2xl" />
            <div className="flex gap-4">
              <Skeleton className="h-14 flex-1 rounded-xl" />
              <Skeleton className="h-14 flex-[2] rounded-xl" />
            </div>
          </div>
        </div>
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-6 shadow-sm">
            <Skeleton className="h-6 w-1/2 rounded" />
            <Skeleton className="h-24 w-full rounded-xl" />
            <div className="space-y-4">
              <Skeleton className="h-12 w-full rounded-lg" />
              <Skeleton className="h-12 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 step-transition">
      {/* Main Content */}
      <div className="lg:col-span-2">
        <div className="glass-card-elevated rounded-2xl p-8 animate-fade-in">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
              <span className="w-10 h-10 bg-gradient-to-br from-secondary to-secondary-dark rounded-xl flex items-center justify-center text-white text-lg shadow-glow-secondary">3</span>
              Driver Details
            </h2>
            <p className="text-gray-300 ml-[52px]">Please provide the main driver's information for this rental</p>
          </div>

          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {inputFields.map((field, index) => {
                const IconComponent = field.icon
                const isLicenseField = field.key === 'licensNumber'
                const showLicenseError = isLicenseField && licenseError && (licenseTouched || details.licensNumber.length > 0)
                const isFieldValid = isLicenseField ? isLicenseValid : !!details[field.key]

                return (
                  <div
                    key={field.key}
                    className={`form-field animate-fade-in relative ${field.half ? '' : 'md:col-span-2'}`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <label className={`block text-sm font-semibold mb-2 transition-colors ${focusedField === field.key ? 'text-secondary' : 'text-gray-300'
                      }`}>
                      <span className="flex items-center gap-2">
                        <IconComponent className="w-4 h-4" />
                        {field.label}
                        <span className="text-red-500">*</span>
                      </span>
                    </label>
                    <div className="relative">
                      <input
                        type={field.type}
                        value={details[field.key]}
                        onChange={(e) => handleInputChange(field.key, e.target.value)}
                        onFocus={() => setFocusedField(field.key)}
                        onBlur={isLicenseField ? handleLicenseBlur : () => setFocusedField(null)}
                        className={`w-full px-4 py-3.5 border-2 rounded-xl focus:outline-none transition-all duration-300 bg-white text-gray-900 ${showLicenseError
                          ? 'border-red-400 bg-red-50'
                          : isFieldValid
                            ? 'border-primary/50 bg-white'
                            : 'border-white/20'
                          } ${focusedField === field.key
                            ? showLicenseError
                              ? 'border-red-400 shadow-lg shadow-red-100 ring-4 ring-red-100'
                              : 'border-secondary shadow-lg shadow-secondary/10 ring-4 ring-secondary/20'
                            : 'hover:border-white/40'
                          }`}
                        placeholder={field.placeholder}
                      />
                      {/* Show check mark for valid fields, warning for invalid license */}
                      {isLicenseField ? (
                        details.licensNumber && (
                          isLicenseValid ? (
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-primary animate-scale-in">
                              <Check className="w-5 h-5" />
                            </span>
                          ) : (
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500 animate-scale-in">
                              <AlertCircle className="w-5 h-5" />
                            </span>
                          )
                        )
                      ) : (
                        details[field.key] && (
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-primary animate-scale-in">
                            <Check className="w-5 h-5" />
                          </span>
                        )
                      )}
                    </div>
                    {/* License validation error message */}
                    {isLicenseField && (
                      <div className="mt-2">
                        {showLicenseError ? (
                          <p className="text-red-500 text-sm flex items-center gap-1.5 animate-fade-in">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            {licenseError}
                          </p>
                        ) : (
                          <p className="text-gray-400 text-xs">
                            {countryName} license format: {licenseFormat.description}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Agreement Checkbox */}
            <div className={`border-2 rounded-2xl p-5 transition-all duration-300 animate-fade-in ${rentalAgreement ? 'border-primary bg-primary/20 shadow-soft' : 'border-white/10 bg-white/5'
              }`}>
              <label className="flex items-start gap-4 cursor-pointer">
                <div className="relative mt-0.5">
                  <input
                    type="checkbox"
                    checked={rentalAgreement}
                    onChange={(e) => setRentalAgreement(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className={`w-6 h-6 rounded-lg border-2 transition-all duration-300 flex items-center justify-center ${rentalAgreement
                    ? 'bg-gradient-to-br from-primary to-primary-dark border-primary'
                    : 'border-gray-400 bg-white'
                    }`}>
                    {rentalAgreement && (
                      <Check className="w-4 h-4 text-white animate-scale-in" />
                    )}
                  </div>
                </div>
                <span className="text-gray-300 leading-relaxed">
                  I have read and agree to the{" "}
                  <a href="#" className="text-secondary hover:text-secondary-dark font-semibold hover:underline">
                    Rental Agreement
                  </a>{" "}
                  and{" "}
                  <a href="#" className="text-secondary hover:text-secondary-dark font-semibold hover:underline">
                    Terms & Conditions
                  </a>
                  <span className="text-red-500 ml-1">*</span>
                </span>
              </label>
            </div>

            {/* Progress indicator */}
            <div className="flex items-center gap-3 text-sm text-gray-400">
              <div className="flex-1 h-2.5 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-500"
                  style={{
                    width: `${(Object.values(details).filter(v => v).length + (rentalAgreement ? 1 : 0)) / 6 * 100}%`
                  }}
                />
              </div>
              <span className="font-semibold text-gray-400">
                {Object.values(details).filter(v => v).length + (rentalAgreement ? 1 : 0)} / 6 complete
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={onBack}
                className="flex-1 btn-outline flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Options
              </button>
              <button
                type="button"
                onClick={handleContinue}
                disabled={!isFormValid || isProcessing}
                className={`flex-[2] font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 ${isFormValid
                  ? "btn-secondary"
                  : "bg-gray-700 text-gray-500 cursor-not-allowed"
                  }`}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    Continue to Confirmation
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Sidebar */}
      <div className="lg:col-span-1">
        <DetailsCardSidebar bookingData={bookingData} exchangeRates={exchangeRates} />
      </div>
    </div>
  )
}

function DetailsCardSidebar({ bookingData, exchangeRates }: { bookingData: BookingData, exchangeRates: any }) {
  const getConvertedPrice = (price: number) => {
    if (!exchangeRates) return price
    return Math.round(convertPrice(price, exchangeRates['USD'], exchangeRates[bookingData.currency]))
  }

  const currencySymbol = ALL_CURRENCIES.find(c => c.code === bookingData.currency)?.symbol || bookingData.currency

  const carPrice = getConvertedPrice(bookingData.selectedCar?.price || 0)
  const extrasTotal = getConvertedPrice(
    bookingData.extras.additionalDriver * 2806.91 +
    bookingData.extras.childSeat * 2806.91 +
    bookingData.extras.boosterSeat * 2806.91
  )

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        weekday: 'short',
        day: 'numeric',
        month: 'short'
      })
    } catch {
      return dateStr
    }
  }

  return (
    <div className="glass-card-elevated rounded-2xl p-5 space-y-6 animate-fade-in sticky top-4">
      <div>
        <h3 className="font-bold text-white mb-4 flex items-center gap-2">
          <div className="icon-container icon-container-sm icon-container-primary rounded-lg">
            <ClipboardList className="w-4 h-4" />
          </div>
          Booking Summary
        </h3>

        {/* Selected Car Preview */}
        {bookingData.selectedCar && (
          <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-xl p-4 mb-4 border border-white/10">
            <div className="flex items-center gap-3">
              <img
                src={bookingData.selectedCar.image || "/placeholder.svg"}
                alt={bookingData.selectedCar.name}
                className="w-16 h-12 object-contain"
              />
              <div>
                <p className="font-bold text-white">{bookingData.selectedCar.name}</p>
                <p className="text-gray-400 text-xs font-medium">{bookingData.selectedCar.category}</p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4 text-sm">
          <div className="flex items-start gap-3">
            <div className="icon-container icon-container-sm icon-container-primary rounded-lg mt-0.5">
              <MapPin className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="text-gray-400 font-medium">Pick-up</p>
              <p className="text-white font-semibold">{bookingData.pickupLocation}</p>
              <p className="text-gray-300">{formatDate(bookingData.pickupDate)} · {bookingData.pickupTime}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="icon-container icon-container-sm icon-container-secondary rounded-lg mt-0.5">
              <Flag className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="text-gray-400 font-medium">Drop-off</p>
              <p className="text-white font-semibold">{bookingData.dropoffLocation}</p>
              <p className="text-gray-300">{formatDate(bookingData.dropoffDate)} · {bookingData.dropoffTime}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 pt-4">
        <h3 className="font-bold text-white mb-3 flex items-center gap-2">
          <div className="icon-container icon-container-sm icon-container-success rounded-lg">
            <Wallet className="w-4 h-4" />
          </div>
          Price Details
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-300">Car Rental</span>
            <span className="text-white font-semibold">{currencySymbol} {carPrice.toLocaleString()}</span>
          </div>
          {extrasTotal > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-300">Extras</span>
              <span className="text-white font-semibold">{currencySymbol} {extrasTotal.toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between pt-3 border-t border-white/10">
            <span className="font-bold text-white text-lg">Total</span>
            <span className="font-bold text-white text-xl">{currencySymbol} {(carPrice + extrasTotal).toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Trust indicators */}
      <div className="bg-gradient-to-br from-white/5 to-white/10 rounded-xl p-4 space-y-2.5 border border-white/10">
        <div className="flex items-center gap-2.5 text-sm text-gray-200">
          <div className="icon-container icon-container-sm bg-white/10 text-primary-light rounded-lg">
            <Lock className="w-3.5 h-3.5" />
          </div>
          <span className="font-medium">Secure booking</span>
        </div>
        <div className="flex items-center gap-2.5 text-sm text-gray-200">
          <div className="icon-container icon-container-sm bg-white/10 text-primary-light rounded-lg">
            <Shield className="w-3.5 h-3.5" />
          </div>
          <span className="font-medium">Free cancellation</span>
        </div>
        <div className="flex items-center gap-2.5 text-sm text-gray-200">
          <div className="icon-container icon-container-sm bg-white/10 text-primary-light rounded-lg">
            <Zap className="w-3.5 h-3.5" />
          </div>
          <span className="font-medium">Instant confirmation</span>
        </div>
      </div>
    </div>
  )
}
