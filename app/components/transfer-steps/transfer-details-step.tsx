"use client"

import { useState } from "react"
import type { TransferBookingData } from "../transfer-booking-form"
import Skeleton from "../Skeleton"
import { convertPrice, ALL_CURRENCIES } from "@/lib/currency"

interface TransferDetailsStepProps {
    bookingData: TransferBookingData
    onUpdateData: (data: Partial<TransferBookingData>) => void
    onNext: () => void
    onBack: () => void
    onEditQuote: () => void
    isLoading?: boolean
    exchangeRates?: any
}

export function TransferDetailsStep({
    bookingData,
    onUpdateData,
    onNext,
    onBack,
    onEditQuote,
    isLoading = false,
    exchangeRates
}: TransferDetailsStepProps) {
    const [isProcessing, setIsProcessing] = useState(false)

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

    const currencySymbol = ALL_CURRENCIES.find(c => c.code === bookingData.currency)?.symbol || bookingData.currency

    const handleContinue = () => {
        setIsProcessing(true)
        setTimeout(() => {
            onNext()
            setIsProcessing(false)
        }, 300)
    }

    const timeHours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'))
    const timeMinutes = ['00', '15', '30', '45']

    if (isLoading) {
        return (
            <div className="step-transition">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-pulse">
                    {/* Sidebar Skeleton */}
                    <div className="lg:col-span-1 space-y-4">
                        <div className="bg-white border border-gray-100 rounded-xl p-6 space-y-4 shadow-sm">
                            <Skeleton className="h-6 w-3/4 rounded" />
                            <div className="space-y-3">
                                <Skeleton className="h-10 w-full rounded-lg" />
                                <Skeleton className="h-10 w-full rounded-lg" />
                                <Skeleton className="h-10 w-full rounded-lg" />
                            </div>
                        </div>
                    </div>

                    {/* Main Content Skeleton */}
                    <div className="lg:col-span-3 space-y-6">
                        <div className="bg-white border border-gray-100 rounded-xl p-8 space-y-6 shadow-sm">
                            <Skeleton className="h-8 w-1/3 rounded" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Skeleton className="h-12 w-full rounded-xl" />
                                <Skeleton className="h-12 w-full rounded-xl" />
                            </div>
                            <Skeleton className="h-12 w-full rounded-xl" />
                            <Skeleton className="h-12 w-full rounded-xl" />
                        </div>

                        <div className="bg-white border border-gray-100 rounded-xl p-8 space-y-6 shadow-sm">
                            <Skeleton className="h-8 w-1/3 rounded" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Skeleton className="h-12 w-full rounded-xl" />
                                <Skeleton className="h-12 w-full rounded-xl" />
                            </div>
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
                                className="btn-primary text-xs font-semibold px-3 py-1.5 rounded transition-colors flex items-center gap-1"
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
                            {bookingData.selectedTransfer && (
                                <div className="pt-3 border-t border-gray-100">
                                    <p className="text-gray-500 text-xs">Transfer Cost</p>
                                    <p className="text-primary font-bold text-lg">
                                        {currencySymbol} {getConvertedPrice(bookingData.selectedTransfer.price).toLocaleString()}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Currency Selector */}
                    {/* <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600 text-sm">Change Currency</span>
                            <div className="bg-teal-500 text-white font-semibold px-3 py-1.5 rounded text-sm">
                                {bookingData.currency} ▼
                            </div>
                        </div>
                    </div> */}
                </div>

                {/* Main Content */}
                <div className="lg:col-span-3 space-y-6">
                    {/* Transfer Details Section */}
                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                        <div className="p-5 border-b border-gray-100">
                            <h2 className="font-bold text-gray-800 text-xl">Transfer Details</h2>
                        </div>
                        <div className="p-5 space-y-5">
                            {/* Date and Time Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-gray-600 text-sm mb-2">Date and Time</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="date"
                                            value={bookingData.date}
                                            onChange={(e) => onUpdateData({ date: e.target.value })}
                                            className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-gray-600 text-sm mb-2">
                                        Pick-Up Time <span className="text-gray-400 text-xs">ⓘ</span>
                                    </label>
                                    <div className="flex gap-2">
                                        <select
                                            value={bookingData.pickupTime.split(':')[0]}
                                            onChange={(e) => onUpdateData({ pickupTime: `${e.target.value}:${bookingData.pickupTime.split(':')[1] || '00'}` })}
                                            className="select-time"
                                        >
                                            {timeHours.map(h => (
                                                <option key={h} value={h}>{h} h</option>
                                            ))}
                                        </select>
                                        <select
                                            value={bookingData.pickupTime.split(':')[1] || '00'}
                                            onChange={(e) => onUpdateData({ pickupTime: `${bookingData.pickupTime.split(':')[0]}:${e.target.value}` })}
                                            className="select-time"
                                        >
                                            {timeMinutes.map(m => (
                                                <option key={m} value={m}>{m} m</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Addresses */}
                            <div>
                                <label className="block text-gray-600 text-sm mb-2">Pick-Up Address</label>
                                <input
                                    type="text"
                                    value={bookingData.pickupAddress}
                                    onChange={(e) => onUpdateData({ pickupAddress: e.target.value })}
                                    placeholder="Enter complete pick-up address"
                                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-600 text-sm mb-2">Destination Address</label>
                                <input
                                    type="text"
                                    value={bookingData.destinationAddress}
                                    onChange={(e) => onUpdateData({ destinationAddress: e.target.value })}
                                    placeholder="Enter complete destination address"
                                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Luggage & Extras Section */}
                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                        <div className="p-5 border-b border-gray-100">
                            <h2 className="font-bold text-gray-800 text-xl">Luggage & Extras</h2>
                        </div>
                        <div className="p-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                {/* Small Luggage */}
                                <div>
                                    <label className="block text-gray-600 text-sm mb-2">
                                        Small Luggage <span className="text-gray-400 text-xs">ⓘ</span>
                                    </label>
                                    <div className="flex items-center">
                                        <button
                                            onClick={() => onUpdateData({ smallLuggage: Math.max(0, bookingData.smallLuggage - 1) })}
                                            className="w-10 h-10 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-l border border-gray-300 transition-colors"
                                        >
                                            −
                                        </button>
                                        <div className="w-16 h-10 flex items-center justify-center border-t border-b border-gray-300 bg-white">
                                            <span className="font-semibold text-gray-800">{bookingData.smallLuggage}</span>
                                        </div>
                                        <button
                                            onClick={() => onUpdateData({ smallLuggage: bookingData.smallLuggage + 1 })}
                                            className="w-10 h-10 bg-primary hover:bg-primary-dark text-white font-bold rounded-r transition-colors"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>

                                {/* Medium Luggage */}
                                <div>
                                    <label className="block text-gray-600 text-sm mb-2">
                                        Medium Luggage <span className="text-gray-400 text-xs">ⓘ</span>
                                    </label>
                                    <div className="flex items-center">
                                        <button
                                            onClick={() => onUpdateData({ mediumLuggage: Math.max(0, bookingData.mediumLuggage - 1) })}
                                            className="w-10 h-10 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-l border border-gray-300 transition-colors"
                                        >
                                            −
                                        </button>
                                        <div className="w-16 h-10 flex items-center justify-center border-t border-b border-gray-300 bg-white">
                                            <span className="font-semibold text-gray-800">{bookingData.mediumLuggage}</span>
                                        </div>
                                        <button
                                            onClick={() => onUpdateData({ mediumLuggage: bookingData.mediumLuggage + 1 })}
                                            className="w-10 h-10 bg-primary hover:bg-primary-dark text-white font-bold rounded-r transition-colors"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Special Instructions */}
                            <div>
                                <label className="block text-gray-600 text-sm mb-2">Special Instructions</label>
                                <textarea
                                    value={bookingData.specialInstructions}
                                    onChange={(e) => onUpdateData({ specialInstructions: e.target.value })}
                                    placeholder="Any special requests or instructions for your driver..."
                                    rows={3}
                                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Passenger Information Section */}
                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                        <div className="p-5 border-b border-gray-100">
                            <h2 className="font-bold text-gray-800 text-xl">Passenger Information</h2>
                        </div>
                        <div className="p-5 space-y-5">
                            {/* Lead Passenger Name */}
                            <div>
                                <label className="block text-gray-600 text-sm mb-2">Lead Passenger Name</label>
                                <div className="flex gap-2">
                                    <select
                                        value={bookingData.passengerTitle}
                                        onChange={(e) => onUpdateData({ passengerTitle: e.target.value })}
                                        className="select-title"
                                    >
                                        <option value="">Title</option>
                                        <option value="Mr">Mr</option>
                                        <option value="Mrs">Mrs</option>
                                        <option value="Ms">Ms</option>
                                        <option value="Dr">Dr</option>
                                    </select>
                                    <input
                                        type="text"
                                        value={bookingData.passengerName}
                                        onChange={(e) => onUpdateData({ passengerName: e.target.value })}
                                        placeholder="Full Name"
                                        className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-gray-600 text-sm mb-2">Email</label>
                                <input
                                    type="email"
                                    value={bookingData.email}
                                    onChange={(e) => onUpdateData({ email: e.target.value })}
                                    placeholder="your.email@example.com"
                                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                            </div>

                            {/* Confirm Email */}
                            <div>
                                <label className="block text-gray-600 text-sm mb-2">Confirm Email</label>
                                <input
                                    type="email"
                                    value={bookingData.confirmEmail}
                                    onChange={(e) => onUpdateData({ confirmEmail: e.target.value })}
                                    placeholder="Confirm your email address"
                                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                            </div>

                            {/* Mobile Phone */}
                            <div>
                                <label className="block text-gray-600 text-sm mb-2">Mobile Phone</label>
                                <div className="flex gap-2">
                                    <div className="flex items-center gap-2 border border-gray-300 rounded px-3 py-2 bg-white">
                                        <span className="text-lg">🇵🇰</span>
                                        <select
                                            value={bookingData.countryCode}
                                            onChange={(e) => onUpdateData({ countryCode: e.target.value })}
                                            className="select-country"
                                        >
                                            <option value="+92">+92</option>
                                            <option value="+1">+1</option>
                                            <option value="+44">+44</option>
                                            <option value="+971">+971</option>
                                        </select>
                                    </div>
                                    <input
                                        type="tel"
                                        value={bookingData.phone}
                                        onChange={(e) => onUpdateData({ phone: e.target.value })}
                                        placeholder="XXX XXXXXXX"
                                        className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4">
                        <button
                            onClick={onBack}
                            className="px-6 py-3 border border-gray-300 rounded text-gray-600 font-medium hover:bg-gray-50 transition-colors"
                        >
                            ← Back
                        </button>
                        <button
                            onClick={handleContinue}
                            disabled={isProcessing}
                            className="btn-primary flex-1 font-semibold py-3 rounded transition-colors flex items-center justify-center gap-2"
                        >
                            {isProcessing ? (
                                <>
                                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>Continue to Payment →</>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
