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

import { PayPalButtons } from "@paypal/react-paypal-js"

export function TransferConfirmationStep({
    bookingData,
    onUpdateData,
    onConfirm,
    onBack,
    onEditQuote,
    isLoading = false,
    exchangeRates,
    bookingReference: propBookingReference
}: TransferConfirmationStepProps) {
    const [isConfirming, setIsConfirming] = useState(false)
    const [isConfirmed, setIsConfirmed] = useState(false)
    const [bookingReference, setBookingReference] = useState(propBookingReference)
    const [error, setError] = useState<string | null>(null)

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

    // PayPal doesn't support all currencies (like PKR). 
    // We'll calculate the USD amount for the transaction.
    const payAmount = exchangeRates
        ? (totalPrice / exchangeRates[bookingData.currency]).toFixed(2)
        : (bookingData.selectedTransfer?.price || 0).toFixed(2)

    const handleCreateOrder = async () => {
        try {
            console.log("Creating Transfer PayPal order with amount:", payAmount, "USD");
            const response = await fetch("/api/paypal/create-order", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    amount: payAmount,
                    currency: "USD",
                }),
            })

            const order = await response.json()
            console.log("Transfer PayPal API Response:", order);
            if (order.error) throw new Error(order.error)
            return order.id
        } catch (err: any) {
            console.error("Error creating PayPal order:", err)
            setError(err.message || "Could not initiate PayPal payment. Please try again.")
            throw err
        }
    }

    const handleApprove = async (data: any) => {
        setIsConfirming(true)
        setError(null)
        try {
            const payload = {
                bookingType: 'transfer',
                fromLocation: bookingData.fromLocation,
                toLocation: bookingData.toLocation,
                date: bookingData.date,
                pickupTime: bookingData.pickupTime,
                passengers: bookingData.passengers,
                currency: bookingData.currency,
                totalPrice: bookingData.selectedTransfer?.price || 0, // Store original price or converted? Original is better for DB

                selectedVehicle: {
                    id: bookingData.selectedTransfer?.id,
                    name: bookingData.selectedTransfer?.name,
                    type: bookingData.selectedTransfer?.type,
                    image: bookingData.selectedTransfer?.image,
                    price: bookingData.selectedTransfer?.price
                },

                fromCoords: bookingData.fromCoords,
                toCoords: bookingData.toCoords,
                estimatedTime: bookingData.estimatedTime,
                estimatedDistance: bookingData.estimatedDistance,

                pickupAddress: bookingData.pickupAddress,
                destinationAddress: bookingData.destinationAddress,
                specialInstructions: bookingData.specialInstructions,
                smallLuggage: bookingData.smallLuggage,
                mediumLuggage: bookingData.mediumLuggage,

                passengerTitle: bookingData.passengerTitle,
                passengerName: bookingData.passengerName,
                email: bookingData.email,
                phone: bookingData.phone,
                countryCode: bookingData.countryCode,

                status: 'confirmed'
            }

            const response = await fetch("/api/paypal/capture-order", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    orderID: data.orderID,
                    bookingData: payload
                }),
            })

            const result = await response.json()

            if (!result.success) {
                throw new Error(result.error || 'Payment capture failed')
            }

            setBookingReference(result.bookingReference)
            setIsConfirmed(true)
        } catch (err: any) {
            console.error("Error capturing PayPal order:", err)
            setError(err.message || "Payment successful but booking failed. Please contact support.")
        } finally {
            setIsConfirming(false)
        }
    }

    if (isConfirmed) {
        return (
            <div className="max-w-2xl mx-auto step-transition">
                <div className="bg-white rounded-lg border border-gray-200 p-8 text-center shadow-lg animate-scale-in">
                    <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                        <span className="text-4xl text-white">✓</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-3">Booking Confirmed!</h2>
                    <p className="text-gray-600 mb-6">Your transfer has been successfully booked and paid via PayPal</p>

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
                                Edit ✏️
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

                            {/* PayPal Buttons */}
                            {error && (
                                <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm font-medium">
                                    {error}
                                </div>
                            )}

                            <div className="mb-6">
                                {isConfirming ? (
                                    <div className="w-full py-4 bg-gray-100 rounded flex items-center justify-center gap-2 text-gray-400 font-bold">
                                        <span className="w-6 h-6 border-3 border-gray-300 border-t-gray-500 rounded-full animate-spin" />
                                        Processing Payment...
                                    </div>
                                ) : (
                                    <div className={bookingData.termsAgreed ? 'opacity-100' : 'opacity-50 pointer-events-none'}>
                                        <PayPalButtons
                                            style={{ layout: 'vertical', color: 'blue', shape: 'rect', label: 'pay' }}
                                            createOrder={handleCreateOrder}
                                            onApprove={handleApprove}
                                            onCancel={() => setError("Payment cancelled. Please try again to complete your booking.")}
                                            onError={(err) => {
                                                console.error("PayPal Error:", err)
                                                setError("There was an error with PayPal. Please try again.")
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Back Button */}
                    <div className="flex justify-start">
                        <button
                            onClick={onBack}
                            disabled={isConfirming}
                            className="px-6 py-3 border border-gray-300 rounded text-gray-600 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                            ← Back to Details
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
