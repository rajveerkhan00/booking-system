"use client"

import { useState } from "react"
import type { TransferBookingData } from "../transfer-booking-form"
import Skeleton from "../Skeleton"
import { convertPrice } from "@/lib/currency"

interface TransferConfirmationStepProps {
    bookingData: TransferBookingData
    onUpdateData: (data: Partial<TransferBookingData>) => void
    onConfirm: () => void
    onBack: () => void
    onEditQuote: () => void
    isLoading?: boolean
    exchangeRates?: any
    bookingReference?: string | null
}

export function TransferConfirmationStep({
    bookingData,
    onUpdateData,
    onConfirm,
    onBack,
    onEditQuote,
    isLoading = false,
    exchangeRates,
    bookingReference
}: TransferConfirmationStepProps) {
    const [isConfirming, setIsConfirming] = useState(false)
    const [isConfirmed, setIsConfirmed] = useState(false)

    const handleConfirm = async () => {
        if (!bookingData.termsAgreed) return

        setIsConfirming(true)
        try {
            // Wait for both the API call and a minimum time for UX
            await Promise.all([
                onConfirm(), // This performs the API call
                new Promise(resolve => setTimeout(resolve, 2000))
            ])
            setIsConfirmed(true)
        } catch (error) {
            console.error("Booking confirmation failed:", error)
            alert("Something went wrong with your booking. Please try again.")
        } finally {
            setIsConfirming(false)
        }
    }

    const formatDate = (dateStr: string) => {
        try {
            return new Date(dateStr).toLocaleDateString('en-US', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            })
        } catch {
            return dateStr
        }
    }

    const getConvertedPrice = (price: number) => {
        if (!exchangeRates) return price
        return Math.round(convertPrice(price, exchangeRates['USD'], exchangeRates[bookingData.currency]))
    }

    const transferCost = getConvertedPrice(bookingData.selectedTransfer?.price || 0)
    const extrasCost = 0 // Can add luggage pricing logic
    const totalPrice = transferCost + extrasCost

    if (isConfirmed) {
        return (
            <div className="max-w-2xl mx-auto step-transition">
                <div className="bg-white rounded-lg border border-gray-200 p-8 text-center shadow-lg animate-scale-in">
                    <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                        <span className="text-4xl text-white">✓</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-3">Booking Confirmed!</h2>
                    <p className="text-gray-600 mb-6">Your transfer has been successfully booked</p>

                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 mb-6 text-left">
                        <p className="text-primary-dark font-semibold mb-2">Booking Reference:</p>
                        <p className="text-2xl font-mono font-bold text-primary tracking-wider uppercase">
                            {bookingReference}
                        </p>
                    </div>

                    <p className="text-gray-600 mb-6">
                        Confirmation email sent to <span className="font-semibold text-gray-800">{bookingData.email}</span>
                    </p>

                    <div className="flex gap-4">
                        <button className="flex-1 border border-gray-300 text-gray-700 font-semibold py-3 rounded hover:bg-gray-50 transition-colors">
                            📧 Email Receipt
                        </button>
                        <button className="flex-1 bg-primary text-white font-semibold py-3 rounded hover:bg-primary-dark transition-colors">
                            📱 View Details
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    if (isLoading) {
        return (
            <div className="step-transition">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-pulse">
                    {/* Sidebar Skeleton */}
                    <div className="lg:col-span-1 space-y-4">
                        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
                            <Skeleton className="h-6 w-3/4 rounded mb-4" />
                            <div className="space-y-3">
                                <Skeleton className="h-10 w-full rounded-lg" />
                                <Skeleton className="h-10 w-full rounded-lg" />
                            </div>
                        </div>
                    </div>

                    {/* Main Content Skeleton */}
                    <div className="lg:col-span-3 space-y-6">
                        <div className="bg-white border border-gray-100 rounded-xl p-8 shadow-sm">
                            <Skeleton className="h-8 w-1/3 rounded mb-6" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Skeleton className="h-10 w-full rounded" />
                                <Skeleton className="h-10 w-full rounded" />
                            </div>
                        </div>

                        <div className="bg-white border border-gray-100 rounded-xl p-8 shadow-sm">
                            <Skeleton className="h-8 w-1/3 rounded mb-6" />
                            <div className="bg-gray-50 rounded-xl p-6 space-y-4 mb-6">
                                <Skeleton className="h-6 w-full rounded" />
                                <Skeleton className="h-6 w-full rounded" />
                                <Skeleton className="h-10 w-full rounded" />
                            </div>
                            <Skeleton className="h-14 w-full rounded-xl" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="step-transition">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar - Summary */}
                <div className="lg:col-span-1 space-y-4">
                    {/* Summary Card */}
                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-bold text-gray-800 text-lg">Summary</h3>
                            <button
                                onClick={onEditQuote}
                                className="bg-primary hover:bg-primary-dark text-white text-xs font-semibold px-3 py-1.5 rounded transition-colors flex items-center gap-1"
                            >
                                Edit Quote ✏️
                            </button>
                        </div>
                        <div className="p-4 space-y-3 text-sm">
                            <div className="flex items-start gap-2">
                                <span className="text-gray-400">🏠➡️</span>
                                <div className="flex-1">
                                    <p className="text-gray-500 text-xs">From</p>
                                    <p className="text-gray-800 font-medium">{bookingData.fromLocation}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-2">
                                <span className="text-gray-400">📍</span>
                                <div className="flex-1">
                                    <p className="text-gray-500 text-xs">To</p>
                                    <p className="text-gray-800 font-medium">{bookingData.toLocation}</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-gray-500 text-xs">Date</p>
                                <p className="text-gray-800 font-medium">{formatDate(bookingData.date)}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 text-xs">Pick-Up Time</p>
                                <p className="text-gray-800 font-medium">{bookingData.pickupTime}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 text-xs">Passengers</p>
                                <p className="text-gray-800 font-medium">{bookingData.passengers}</p>
                            </div>
                        </div>
                    </div>

                    {/* Currency Selector */}
                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600 text-sm">Change Currency</span>
                            <div className="bg-primary text-white font-semibold px-3 py-1.5 rounded text-sm">
                                {bookingData.currency} ▼
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-3 space-y-6">
                    {/* Passenger Information Review */}
                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                        <div className="p-5 border-b border-gray-100">
                            <h2 className="font-bold text-gray-800 text-xl">Passenger Information</h2>
                        </div>
                        <div className="p-5 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-500">Lead Passenger</p>
                                    <p className="text-gray-800 font-semibold">
                                        {bookingData.passengerTitle} {bookingData.passengerName}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Email</p>
                                    <p className="text-gray-800 font-semibold">{bookingData.email}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Mobile Phone</p>
                                    <p className="text-gray-800 font-semibold">{bookingData.countryCode} {bookingData.phone}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Pick-Up Address</p>
                                    <p className="text-gray-800 font-semibold">{bookingData.pickupAddress || '-'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Payment Details */}
                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                        <div className="p-5 border-b border-gray-100">
                            <h2 className="font-bold text-gray-800 text-xl">Payment Details</h2>
                        </div>
                        <div className="p-5">
                            {/* Price Summary Box */}
                            <div className="bg-warning/10 border border-warning/20 rounded-lg p-5 mb-6">
                                <h3 className="font-bold text-gray-800 mb-4">Summary</h3>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Vehicle Type</span>
                                        <span className="text-gray-800 font-semibold">{bookingData.selectedTransfer?.name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Transfer(s) Cost</span>
                                        <span className="text-gray-800 font-semibold">
                                            {bookingData.currency} {transferCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Extras Cost</span>
                                        <span className="text-gray-800 font-semibold">
                                            {bookingData.currency} {extrasCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                    <div className="flex justify-between pt-3 border-t border-warning/30">
                                        <span className="text-gray-800 font-bold">Total Price</span>
                                        <span className="text-gray-800 font-bold text-lg">
                                            {bookingData.currency} {totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Terms Agreement */}
                            <div className="mb-6">
                                <label className="flex items-start gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={bookingData.termsAgreed}
                                        onChange={(e) => onUpdateData({ termsAgreed: e.target.checked })}
                                        className="w-5 h-5 mt-0.5 rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                    <span className="text-gray-700 text-sm">
                                        I have read and agree to the{" "}
                                        <a href="#" className="text-primary hover:underline font-medium">terms and conditions</a>
                                        {" "}and{" "}
                                        <a href="#" className="text-primary hover:underline font-medium">privacy policy</a>
                                    </span>
                                </label>
                            </div>

                            {/* Continue to Payment Button */}
                            <button
                                onClick={handleConfirm}
                                disabled={!bookingData.termsAgreed || isConfirming}
                                className={`w-full py-4 rounded font-semibold text-lg transition-all flex items-center justify-center gap-2 ${bookingData.termsAgreed && !isConfirming
                                    ? 'bg-primary hover:bg-primary-dark text-white shadow-lg shadow-primary/30'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    }`}
                            >
                                {isConfirming ? (
                                    <>
                                        <span className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                                        Processing Payment...
                                    </>
                                ) : (
                                    <>CONTINUE TO PAYMENT →</>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Back Button */}
                    <div className="flex justify-start">
                        <button
                            onClick={onBack}
                            className="px-6 py-3 border border-gray-300 rounded text-gray-600 font-medium hover:bg-gray-50 transition-colors"
                        >
                            ← Back to Details
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
