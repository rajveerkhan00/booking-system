"use client"

import type { BookingData } from "../booking-form"
import { useState } from "react"
import Skeleton from "../Skeleton"
import {
  CheckCircle,
  Mail,
  Users,
  Route,
  Briefcase,
  Gauge,
  Plane,
  Shield,
  Check,
  ArrowLeft,
  ArrowRight,
  Lock,
  Loader2,
  ClipboardList,
  Wallet,
  UserPlus,
  Baby,
  Info,
  Minus,
  Plus
} from "lucide-react"
import { convertPrice, ALL_CURRENCIES } from "@/lib/currency"

interface OptionsStepProps {
  bookingData: BookingData
  onUpdateExtras: (extras: BookingData["extras"]) => void
  onNext: () => void
  onBack?: () => void
  isLoading?: boolean
  exchangeRates?: any
}

const EXTRAS_PRICING = {
  additionalDriver: 2806.91,
  childSeat: 2806.91,
  boosterSeat: 2806.91,
}

export function OptionsStep({
  bookingData,
  onUpdateExtras,
  onNext,
  onBack,
  isLoading = false,
  exchangeRates
}: OptionsStepProps) {
  const [extras, setExtras] = useState(bookingData.extras)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleExtrasChange = (key: keyof typeof extras, value: number) => {
    const newExtras = { ...extras, [key]: Math.max(0, value) }
    setExtras(newExtras)
    onUpdateExtras(newExtras)
  }

  const handleContinue = () => {
    setIsProcessing(true)
    setTimeout(() => {
      onNext()
      setIsProcessing(false)
    }, 300)
  }

  const getConvertedPrice = (price: number) => {
    if (!exchangeRates) return price
    return Math.round(convertPrice(price, exchangeRates['USD'], exchangeRates[bookingData.currency]))
  }

  const currencySymbol = ALL_CURRENCIES.find(c => c.code === bookingData.currency)?.symbol || bookingData.currency

  const carPrice = getConvertedPrice(bookingData.selectedCar?.price || 0)
  const extrasTotal = getConvertedPrice(
    extras.additionalDriver * EXTRAS_PRICING.additionalDriver +
    extras.childSeat * EXTRAS_PRICING.childSeat +
    extras.boosterSeat * EXTRAS_PRICING.boosterSeat
  )
  const totalPrice = carPrice + extrasTotal

  if (!bookingData.selectedCar) {
    return (
      <div className="glass-card-elevated rounded-2xl p-12 text-center animate-fade-in">
        <div className="icon-container icon-container-lg icon-container-secondary mx-auto mb-4 rounded-2xl w-16 h-16">
          <Briefcase className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">No car selected</h3>
        <p className="text-gray-600 mb-6">Please go back and select a vehicle first.</p>
        {onBack && (
          <button
            onClick={onBack}
            className="btn-secondary inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        )}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse">
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-16 w-full rounded-2xl" />
          <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-6 shadow-sm">
            <div className="flex justify-between items-center">
              <Skeleton className="h-8 w-1/3 rounded" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Skeleton className="h-48 w-full rounded-2xl" />
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Skeleton className="h-20 rounded-xl" />
                  <Skeleton className="h-20 rounded-xl" />
                  <Skeleton className="h-20 rounded-xl" />
                  <Skeleton className="h-20 rounded-xl" />
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-6 shadow-sm">
            <Skeleton className="h-8 w-1/3 rounded" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Skeleton className="h-40 rounded-2xl" />
              <Skeleton className="h-40 rounded-2xl" />
              <Skeleton className="h-40 rounded-2xl" />
            </div>
          </div>
        </div>
        <div className="lg:col-span-1 space-y-4">
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 step-transition">
      {/* Main Content */}
      <div className="lg:col-span-2 space-y-6">
        {/* Info Banner */}
        <div className="bg-gradient-to-r from-success/10 to-primary/10 border border-success/20 rounded-2xl p-5 flex items-center gap-4 shadow-soft animate-fade-in">
          <div className="w-12 h-12 bg-gradient-to-br from-success to-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-success/30 flex-shrink-0">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <p className="text-gray-800 font-semibold">Free cancellation up to 48 hours before pick-up</p>
            <p className="text-gray-600 text-sm mt-1">Change your plans? No problem!</p>
          </div>
          <button className="text-gray-600 hover:text-gray-900 font-medium text-sm flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl shadow-soft hover:shadow-medium transition-all border border-gray-100">
            <Mail className="w-4 h-4" />
            Email Quote
          </button>
        </div>

        {/* Selected Car */}
        <div className="glass-card-elevated rounded-2xl p-6 animate-fade-in stagger-1">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-bold text-xl text-gray-900">{bookingData.selectedCar.name}</h3>
              <p className="text-gray-500 text-sm font-medium">{bookingData.selectedCar.category}</p>
            </div>
            <span className="badge badge-success">
              <Check className="w-3.5 h-3.5" />
              Selected
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-2xl p-6 border border-gray-100">
              <img
                src={bookingData.selectedCar.image || "/placeholder.svg"}
                alt={bookingData.selectedCar.name}
                className="w-full h-40 object-contain"
              />
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl p-3 border border-gray-100">
                  <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                    <Users className="w-3.5 h-3.5" />
                    Seats
                  </div>
                  <p className="font-bold text-gray-900 text-lg">{bookingData.selectedCar.seats}</p>
                </div>
                <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl p-3 border border-gray-100">
                  <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                    <Route className="w-3.5 h-3.5" />
                    Per Rental
                  </div>
                  <p className="font-bold text-gray-900 text-lg">400 Km</p>
                </div>
                <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl p-3 border border-gray-100">
                  <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                    <Briefcase className="w-3.5 h-3.5" />
                    Bags
                  </div>
                  <p className="font-bold text-gray-900 text-lg">{bookingData.selectedCar.bags}</p>
                </div>
                <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl p-3 border border-gray-100">
                  <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                    <Gauge className="w-3.5 h-3.5" />
                    Type
                  </div>
                  <p className="font-bold text-gray-900 text-lg">{bookingData.selectedCar.transmission}</p>
                </div>
              </div>

              <div className="space-y-2.5 text-sm text-gray-600">
                <div className="flex items-center gap-3">
                  <div className="icon-container icon-container-sm icon-container-primary rounded-lg">
                    <Plane className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-medium">Free Shuttle Bus</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="icon-container icon-container-sm icon-container-secondary rounded-lg">
                    <Shield className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-medium">Damage & theft coverage</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-100 flex justify-between items-center">
            <span className="badge badge-success">
              <Check className="w-3.5 h-3.5" />
              Free Cancellation
            </span>
            <div className="text-right">
              <p className="text-gray-500 text-sm font-medium">Car hire fee</p>
              <p className="text-3xl font-bold text-gray-900">{currencySymbol} {carPrice.toLocaleString()}</p>
              <p className="text-secondary text-sm font-semibold">{currencySymbol} {(carPrice / 4).toLocaleString()} per day</p>
            </div>
          </div>
        </div>

        {/* Optional Extras */}
        <div className="glass-card-elevated rounded-2xl p-6 animate-fade-in stagger-2">
          <h3 className="font-bold text-xl text-gray-900 mb-2">Optional Extras</h3>
          <p className="text-gray-500 mb-6">Payable at pick-up location</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ExtraCard
              icon={UserPlus}
              title="Additional Driver"
              price={getConvertedPrice(EXTRAS_PRICING.additionalDriver)}
              currencySymbol={currencySymbol}
              quantity={extras.additionalDriver}
              onQuantityChange={(value) => handleExtrasChange("additionalDriver", value)}
            />
            <ExtraCard
              icon={Baby}
              title="Child toddler seat"
              price={getConvertedPrice(EXTRAS_PRICING.childSeat)}
              currencySymbol={currencySymbol}
              quantity={extras.childSeat}
              onQuantityChange={(value) => handleExtrasChange("childSeat", value)}
              info
            />
            <ExtraCard
              icon={Baby}
              title="Booster seat"
              price={getConvertedPrice(EXTRAS_PRICING.boosterSeat)}
              currencySymbol={currencySymbol}
              quantity={extras.boosterSeat}
              onQuantityChange={(value) => handleExtrasChange("boosterSeat", value)}
              info
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 animate-fade-in stagger-3">
          <button
            onClick={onBack}
            className="flex-1 btn-outline flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <button
            onClick={handleContinue}
            disabled={isLoading}
            className="flex-[2] btn-secondary flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                Continue to Details
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Sidebar - Trip & Price Summary */}
      <div className="lg:col-span-1 space-y-4">
        <TripSummaryCard bookingData={bookingData} currencySymbol={currencySymbol} />
        <PriceSummaryCard
          carPrice={carPrice}
          extrasTotal={extrasTotal}
          totalPrice={totalPrice}
          currencySymbol={currencySymbol}
        />
      </div>
    </div>
  )
}

interface ExtraCardProps {
  icon: React.ElementType
  title: string
  price: number
  currencySymbol: string
  quantity: number
  onQuantityChange: (value: number) => void
  info?: boolean
}

function ExtraCard({ icon: Icon, title, price, currencySymbol, quantity, onQuantityChange, info }: ExtraCardProps) {
  return (
    <div className={`border-2 rounded-2xl p-5 transition-all duration-300 ${quantity > 0 ? 'border-primary bg-primary/5 shadow-soft' : 'border-gray-200 hover:border-gray-300'
      }`}>
      <div className="flex items-center gap-3 mb-3">
        <div className={`icon-container icon-container-md rounded-xl ${quantity > 0 ? 'icon-container-primary' : 'bg-gray-100 text-gray-500'}`}>
          <Icon className="w-5 h-5" />
        </div>
        <p className="font-bold text-gray-900 flex-1">{title}</p>
        {info && (
          <button className="text-gray-400 hover:text-gray-600 transition-colors">
            <Info className="w-4 h-4" />
          </button>
        )}
      </div>
      <p className="text-gray-900 font-bold text-lg mb-1">{currencySymbol} {price.toLocaleString()}</p>
      <p className="text-gray-500 text-sm mb-4">Per rental</p>
      <div className="flex items-center justify-between bg-gray-100 rounded-xl p-2">
        <button
          onClick={() => onQuantityChange(quantity - 1)}
          className="w-10 h-10 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-all"
        >
          <Minus className="w-4 h-4" />
        </button>
        <span className="text-gray-900 font-bold text-xl min-w-8 text-center">{quantity}</span>
        <button
          onClick={() => onQuantityChange(quantity + 1)}
          className="w-10 h-10 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-all"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

function TripSummaryCard({ bookingData, currencySymbol }: { bookingData: BookingData, currencySymbol: string }) {
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
    <div className="glass-card-elevated rounded-2xl p-5 animate-fade-in">
      <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
        <div className="icon-container icon-container-sm icon-container-primary rounded-lg">
          <ClipboardList className="w-4 h-4" />
        </div>
        Trip Summary
      </h3>
      <div className="space-y-4 text-sm">
        <div className="flex items-start gap-3">
          <div className="w-2.5 h-2.5 bg-gradient-to-br from-primary to-primary-dark rounded-full mt-1.5 shadow-sm"></div>
          <div>
            <p className="text-gray-500 font-medium">Pick-up</p>
            <p className="text-gray-900 font-semibold">{bookingData.pickupLocation}</p>
            <p className="text-gray-600">{formatDate(bookingData.pickupDate)} · {bookingData.pickupTime}</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="w-2.5 h-2.5 bg-gradient-to-br from-secondary to-secondary-dark rounded-full mt-1.5 shadow-sm"></div>
          <div>
            <p className="text-gray-500 font-medium">Drop-off</p>
            <p className="text-gray-900 font-semibold">{bookingData.dropoffLocation}</p>
            <p className="text-gray-600">{formatDate(bookingData.dropoffDate)} · {bookingData.dropoffTime}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function PriceSummaryCard({
  carPrice,
  extrasTotal,
  totalPrice,
  currencySymbol
}: {
  carPrice: number
  extrasTotal: number
  totalPrice: number
  currencySymbol: string
}) {
  return (
    <div className="glass-card-elevated rounded-2xl p-5 space-y-4 animate-fade-in stagger-1">
      <h3 className="font-bold text-gray-900 flex items-center gap-2">
        <div className="icon-container icon-container-sm icon-container-success rounded-lg">
          <Wallet className="w-4 h-4" />
        </div>
        Price Summary
      </h3>
      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Car hire fee</span>
          <span className="text-gray-900 font-semibold">{currencySymbol} {carPrice.toLocaleString()}</span>
        </div>
        <div className="pl-4 space-y-1.5 text-gray-500 text-xs">
          <p className="flex items-center gap-1.5">
            <Check className="w-3 h-3 text-success" />
            Airport fee included
          </p>
          <p className="flex items-center gap-1.5">
            <Check className="w-3 h-3 text-success" />
            Tax included
          </p>
        </div>
        {extrasTotal > 0 && (
          <div className="flex justify-between pt-2 border-t border-gray-100">
            <span className="text-gray-600">Extras (at pick-up)</span>
            <span className="text-gray-900 font-semibold">{currencySymbol} {extrasTotal.toLocaleString()}</span>
          </div>
        )}
      </div>
      <div className="border-t border-gray-200 pt-4 flex justify-between items-center">
        <span className="font-bold text-gray-900 text-lg">Total</span>
        <span className="font-bold text-gray-900 text-2xl">{currencySymbol} {totalPrice.toLocaleString()}</span>
      </div>
    </div>
  )
}
