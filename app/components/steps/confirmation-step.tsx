"use client"

import type { BookingData } from "../booking-form"
import { useState } from "react"
import Skeleton from "../Skeleton"
import {
  MapPin,
  Flag,
  Car,
  User,
  Users,
  Briefcase,
  Gauge,
  Mail,
  Phone,
  CreditCard,
  Settings,
  UserPlus,
  Baby,
  ArrowLeft,
  Check,
  Loader2,
  Wallet,
  ThumbsUp,
  Trophy,
  Zap,
  Lock,
  PartyPopper,
  Download,
  Sparkles
} from "lucide-react"
import { convertPrice, ALL_CURRENCIES } from "@/lib/currency"

interface ConfirmationStepProps {
  bookingData: BookingData
  onConfirm: () => Promise<void> | void
  onBack?: () => void
  isLoading?: boolean
  exchangeRates?: any
  bookingReference?: string
}

export function ConfirmationStep({
  bookingData,
  onConfirm,
  onBack,
  isLoading = false,
  exchangeRates,
  bookingReference
}: ConfirmationStepProps) {
  const [isConfirming, setIsConfirming] = useState(false)
  const [isConfirmed, setIsConfirmed] = useState(false)

  const carPrice = bookingData.selectedCar?.price || 0
  const extrasTotal =
    bookingData.extras.additionalDriver * 2806.91 +
    bookingData.extras.childSeat * 2806.91 +
    bookingData.extras.boosterSeat * 2806.91
  const totalPrice = carPrice + extrasTotal

  const handleConfirm = async () => {
    setIsConfirming(true)
    try {
      await onConfirm()
      setIsConfirmed(true)
    } catch (error) {
      console.error("Confirmation failed", error)
    } finally {
      setIsConfirming(false)
    }
  }

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    } catch {
      return dateStr
    }
  }

  if (isConfirmed) {
    return (
      <div className="max-w-2xl mx-auto step-transition">
        <div className="glass-card-elevated rounded-2xl p-10 text-center animate-scale-in">
          <div className="w-24 h-24 bg-gradient-to-br from-success to-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-success/30 animate-bounce">
            <PartyPopper className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Booking Confirmed!</h2>
          <p className="text-gray-600 mb-8">Your reservation has been successfully completed</p>

          <div className="bg-gradient-to-br from-success/10 to-primary/10 border border-success/20 rounded-2xl p-6 mb-8 text-left">
            <p className="text-success-dark font-semibold mb-2 text-sm">Confirmation Number:</p>
            <p className="text-3xl font-mono font-bold text-success tracking-wider uppercase">
              {bookingReference}
            </p>
          </div>

          <p className="text-gray-600 mb-8">
            A confirmation email has been sent to <span className="font-semibold text-gray-900">{bookingData.driverDetails.email}</span>
          </p>

          <div className="flex gap-4">
            <button className="flex-1 btn-outline flex items-center justify-center gap-2">
              <Mail className="w-4 h-4" />
              Email Receipt
            </button>
            <button className="flex-1 btn-secondary flex items-center justify-center gap-2">
              <Download className="w-4 h-4" />
              Download App
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white border border-gray-100 rounded-2xl p-8 space-y-8 shadow-sm">
            <Skeleton className="h-10 w-1/3 rounded mb-8" />
            <div className="space-y-6">
              <Skeleton className="h-40 w-full rounded-2xl" />
              <Skeleton className="h-40 w-full rounded-2xl" />
              <Skeleton className="h-40 w-full rounded-2xl" />
            </div>
            <div className="flex gap-4 pt-4">
              <Skeleton className="h-14 flex-1 rounded-xl" />
              <Skeleton className="h-14 flex-[2] rounded-xl" />
            </div>
          </div>
        </div>
        <div className="lg:col-span-1 space-y-4">
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 step-transition">
      {/* Main Content */}
      <div className="lg:col-span-2">
        <div className="glass-card-elevated rounded-2xl p-8 space-y-8 animate-fade-in">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <span className="w-10 h-10 bg-gradient-to-br from-secondary to-secondary-dark rounded-xl flex items-center justify-center text-white text-lg shadow-glow-secondary">4</span>
              Confirm Your Booking
            </h2>
            <p className="text-gray-600 ml-[52px]">Please review all details before confirming</p>
          </div>

          {/* Booking Details */}
          <div className="border-t border-gray-100 pt-8 animate-fade-in stagger-1">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <div className="icon-container icon-container-md icon-container-primary rounded-xl">
                <MapPin className="w-5 h-5" />
              </div>
              Trip Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-2xl p-5 border border-gray-100">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-gradient-to-br from-primary to-primary-dark"></div>
                  <p className="text-primary text-xs font-semibold uppercase tracking-wide">Pick-up</p>
                </div>
                <p className="text-gray-900 font-bold text-lg">{bookingData.pickupLocation}</p>
                <p className="text-gray-600 mt-1">{formatDate(bookingData.pickupDate)}</p>
                <p className="text-gray-600">{bookingData.pickupTime}</p>
              </div>
              <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-2xl p-5 border border-gray-100">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-gradient-to-br from-secondary to-secondary-dark"></div>
                  <p className="text-secondary text-xs font-semibold uppercase tracking-wide">Drop-off</p>
                </div>
                <p className="text-gray-900 font-bold text-lg">{bookingData.dropoffLocation}</p>
                <p className="text-gray-600 mt-1">{formatDate(bookingData.dropoffDate)}</p>
                <p className="text-gray-600">{bookingData.dropoffTime}</p>
              </div>
            </div>
          </div>

          {/* Vehicle Details */}
          <div className="border-t border-gray-100 pt-8 animate-fade-in stagger-2">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <div className="icon-container icon-container-md icon-container-secondary rounded-xl">
                <Car className="w-5 h-5" />
              </div>
              Vehicle Details
            </h3>
            <div className="flex flex-col sm:flex-row gap-6 bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-2xl p-5 border border-gray-100">
              <div className="flex-shrink-0 flex items-center justify-center bg-white rounded-xl p-2 h-32 sm:h-auto">
                <img
                  src={bookingData.selectedCar?.image || "/placeholder.svg"}
                  alt={bookingData.selectedCar?.name}
                  className="w-40 h-28 object-contain"
                />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-gray-900 text-xl mb-1">{bookingData.selectedCar?.name}</h4>
                <p className="text-gray-500 text-sm mb-3 font-medium">{bookingData.selectedCar?.category}</p>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-gray-600 bg-white px-3 py-1.5 rounded-lg border border-gray-100 shadow-soft">
                    <Users className="w-3.5 h-3.5 text-gray-500" />
                    {bookingData.selectedCar?.seats} seats
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-gray-600 bg-white px-3 py-1.5 rounded-lg border border-gray-100 shadow-soft">
                    <Briefcase className="w-3.5 h-3.5 text-gray-500" />
                    {bookingData.selectedCar?.bags} bags
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-gray-600 bg-white px-3 py-1.5 rounded-lg border border-gray-100 shadow-soft">
                    <Gauge className="w-3.5 h-3.5 text-gray-500" />
                    {bookingData.selectedCar?.transmission}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Driver Details */}
          <div className="border-t border-gray-100 pt-8 animate-fade-in stagger-3">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <div className="icon-container icon-container-md icon-container-accent rounded-xl">
                <User className="w-5 h-5" />
              </div>
              Driver Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl p-4 border border-gray-100">
                <div className="flex items-center gap-2 text-gray-500 text-xs uppercase tracking-wide mb-1">
                  <User className="w-3 h-3" />
                  Full Name
                </div>
                <p className="text-gray-900 font-semibold text-lg">
                  {bookingData.driverDetails.firstName} {bookingData.driverDetails.lastName}
                </p>
              </div>
              <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl p-4 border border-gray-100">
                <div className="flex items-center gap-2 text-gray-500 text-xs uppercase tracking-wide mb-1">
                  <Mail className="w-3 h-3" />
                  Email
                </div>
                <p className="text-gray-900 font-semibold">{bookingData.driverDetails.email}</p>
              </div>
              <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl p-4 border border-gray-100">
                <div className="flex items-center gap-2 text-gray-500 text-xs uppercase tracking-wide mb-1">
                  <Phone className="w-3 h-3" />
                  Phone
                </div>
                <p className="text-gray-900 font-semibold">{bookingData.driverDetails.phone}</p>
              </div>
              <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl p-4 border border-gray-100">
                <div className="flex items-center gap-2 text-gray-500 text-xs uppercase tracking-wide mb-1">
                  <CreditCard className="w-3 h-3" />
                  License Number
                </div>
                <p className="text-gray-900 font-semibold">{bookingData.driverDetails.licensNumber}</p>
              </div>
            </div>
          </div>

          {/* Extras */}
          {extrasTotal > 0 && (
            <div className="border-t border-gray-100 pt-8 animate-fade-in stagger-4">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <div className="icon-container icon-container-md bg-warning/20 text-warning rounded-xl">
                  <Settings className="w-5 h-5" />
                </div>
                Selected Extras
              </h3>
              <div className="flex flex-wrap gap-3">
                {bookingData.extras.additionalDriver > 0 && (
                  <span className="inline-flex items-center gap-2 bg-gradient-to-br from-amber-50 to-orange-50 text-amber-800 px-4 py-2.5 rounded-xl font-medium border border-amber-200">
                    <UserPlus className="w-4 h-4" />
                    Additional Driver × {bookingData.extras.additionalDriver}
                  </span>
                )}
                {bookingData.extras.childSeat > 0 && (
                  <span className="inline-flex items-center gap-2 bg-gradient-to-br from-amber-50 to-orange-50 text-amber-800 px-4 py-2.5 rounded-xl font-medium border border-amber-200">
                    <Baby className="w-4 h-4" />
                    Child Seat × {bookingData.extras.childSeat}
                  </span>
                )}
                {bookingData.extras.boosterSeat > 0 && (
                  <span className="inline-flex items-center gap-2 bg-gradient-to-br from-amber-50 to-orange-50 text-amber-800 px-4 py-2.5 rounded-xl font-medium border border-amber-200">
                    <Baby className="w-4 h-4" />
                    Booster Seat × {bookingData.extras.boosterSeat}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="border-t border-gray-100 pt-8 animate-fade-in stagger-5">
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={onBack}
                className="w-full sm:flex-1 btn-outline flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Edit Details
              </button>
              <button
                onClick={handleConfirm}
                disabled={isConfirming}
                className="w-full sm:flex-[2] bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-success/30 hover:shadow-xl hover:shadow-emerald-500/40 transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5"
              >
                {isConfirming ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Confirming Booking...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    Confirm & Book Now
                  </>
                )}
              </button>
            </div>
            <p className="text-gray-500 text-sm text-center mt-4">
              By clicking confirm, you agree to our terms and conditions
            </p>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="lg:col-span-1">
        <ConfirmationSidebar bookingData={bookingData} exchangeRates={exchangeRates} />
      </div>
    </div>
  )
}

function ConfirmationSidebar({ bookingData, exchangeRates }: { bookingData: BookingData, exchangeRates: any }) {
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
  const totalPrice = carPrice + extrasTotal

  return (
    <div className="space-y-4 sticky top-4">
      {/* Price Breakdown */}
      <div className="glass-card-elevated rounded-2xl p-5 space-y-4 animate-fade-in">
        <h3 className="font-bold text-gray-900 flex items-center gap-2">
          <div className="icon-container icon-container-sm icon-container-success rounded-lg">
            <Wallet className="w-4 h-4" />
          </div>
          Price Breakdown
        </h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Car hire fee (4 days)</span>
            <span className="text-gray-900 font-semibold">{currencySymbol} {carPrice.toLocaleString()}</span>
          </div>
          {extrasTotal > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Selected extras</span>
              <span className="text-gray-900 font-semibold">{currencySymbol} {extrasTotal.toLocaleString()}</span>
            </div>
          )}
          <div className="pl-4 space-y-1.5 text-xs text-gray-500">
            <p className="flex items-center gap-1.5">
              <Check className="w-3 h-3 text-success" />
              Airport fee included
            </p>
            <p className="flex items-center gap-1.5">
              <Check className="w-3 h-3 text-success" />
              All taxes included
            </p>
          </div>
          <div className="flex justify-between pt-4 border-t-2 border-gray-200 items-center">
            <span className="font-bold text-gray-900 text-xl">Total</span>
            <span className="font-bold text-gray-900 text-2xl">{currencySymbol} {totalPrice.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Why Book With Us */}
      <div className="bg-gradient-to-br from-secondary/10 to-primary/10 border border-secondary/20 rounded-2xl p-5 space-y-4 animate-fade-in stagger-1">
        <h3 className="font-bold text-gray-900 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-secondary" />
          Why book with us?
        </h3>

        <div className="flex items-start gap-3">
          <div className="icon-container icon-container-md bg-white shadow-soft text-primary rounded-xl flex-shrink-0">
            <ThumbsUp className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm">Great Choice!</p>
            <p className="text-gray-600 text-xs">
              Top-rated car hire brand based on customer reviews.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="icon-container icon-container-md bg-white shadow-soft text-warning rounded-xl flex-shrink-0">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm">Best Experience</p>
            <p className="text-gray-600 text-xs">
              Enjoy quick service and friendly staff.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="icon-container icon-container-md bg-white shadow-soft text-secondary rounded-xl flex-shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm">Shortest Queue</p>
            <p className="text-gray-600 text-xs">
              Fastest average wait times at pickup.
            </p>
          </div>
        </div>
      </div>

      {/* Security Badge */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-2xl p-5 text-center animate-fade-in stagger-2">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="icon-container icon-container-md bg-white/10 text-white rounded-xl">
            <Lock className="w-5 h-5" />
          </div>
          <span className="font-bold text-lg">Secure Payment</span>
        </div>
        <p className="text-gray-400 text-sm">
          Your payment information is encrypted and secure
        </p>
      </div>
    </div>
  )
}
