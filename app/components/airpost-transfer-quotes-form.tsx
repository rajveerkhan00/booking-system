"use client"

import { useState } from "react"
import { ChevronRight, ChevronDown, Info, MapPin, Clock, Users, DollarSign, Star, Car, Truck, Bus, Briefcase, Check, CircleArrowRight } from "lucide-react"

interface Quote {
  id: number
  vehicle: string
  type: string
  service: string
  image: string
  rating: number
  passengers: number
  medium: number
  small: number
  price: number
  cancellation: string
}

const QUOTES: Quote[] = [
  {
    id: 1,
    vehicle: "Sedan Car",
    type: "3pax",
    service: "Standard Service",
    image: "🚗",
    rating: 5,
    passengers: 3,
    medium: 2,
    small: 3,
    price: 2269.46,
    cancellation: "Free Cancellation 24h",
  },
  {
    id: 2,
    vehicle: "MPV",
    type: "4pax",
    service: "Standard Service",
    image: "🚙",
    rating: 5,
    passengers: 4,
    medium: 4,
    small: 4,
    price: 2937.8,
    cancellation: "Free Cancellation 24h",
  },
  {
    id: 3,
    vehicle: "Minivan",
    type: "Spax",
    service: "Standard Service",
    image: "🚐",
    rating: 5,
    passengers: 5,
    medium: 5,
    small: 5,
    price: 3500.0,
    cancellation: "Free Cancellation 24h",
  },
]

export default function TransferQuotesForm() {
  const [currentStep, setCurrentStep] = useState(1)
  const [sortBy, setSortBy] = useState("price-asc")

  const steps = [
    { number: 1, label: "Search Results" },
    { number: 2, label: "Transfer Details" },
    { number: 3, label: "Confirmation" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-secondary text-xl font-bold">Need</h1>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Step Indicator */}
        <div className="flex justify-center items-center gap-8 mb-12">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center gap-8">
              <div className="flex flex-col items-center gap-2">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm border-2 ${currentStep >= step.number
                    ? "bg-primary border-primary text-white"
                    : "bg-white border-slate-300 text-slate-400"
                    }`}
                >
                  {step.number}
                </div>
                {currentStep === step.number && (
                  <span className="text-primary text-xs font-medium">
                    {step.number === 1 && "🔍 Search Results"}
                    {step.number === 2 && "📋 Transfer Details"}
                    {step.number === 3 && "✓ Confirmation"}
                  </span>
                )}
              </div>
              {index < steps.length - 1 && (
                <div className={`w-32 h-1 ${currentStep > step.number ? "bg-primary" : "bg-slate-300"}`} />
              )}
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Summary</h2>

              {/* Trip Icons */}
              <div className="flex gap-2 mb-6 text-slate-500">
                <MapPin className="w-5 h-5" />
                <ChevronRight className="w-5 h-5" />
              </div>

              {/* Trip Details */}
              <div className="space-y-4 mb-6 pb-6 border-b border-slate-200">
                <div>
                  <p className="text-sm text-slate-600 font-medium mb-1">From</p>
                  <p className="text-sm font-semibold text-slate-900">Karachi Karachi, Karachi City, Sindh, Pakistan</p>
                </div>

                <div>
                  <p className="text-sm text-slate-600 font-medium mb-1">To</p>
                  <p className="text-sm font-semibold text-slate-900">Lahore Lahore, Punjab, Pakistan</p>
                </div>

                <div>
                  <p className="text-sm text-slate-600 font-medium mb-1">Date</p>
                  <p className="text-sm font-semibold text-slate-900">04/Jan/2026</p>
                </div>

                <div>
                  <p className="text-sm text-slate-600 font-medium mb-1">Pick-Up Time</p>
                  <p className="text-sm font-semibold text-slate-900">12:00</p>
                </div>

                <div>
                  <p className="text-sm text-slate-600 font-medium mb-1">Passengers</p>
                  <p className="text-sm font-semibold text-slate-900">2</p>
                </div>
              </div>

              {/* Currency Selector */}
              <div className="mb-6 pb-6 border-b border-slate-200">
                <p className="text-sm text-slate-600 font-medium mb-3">Change Currency</p>
                <button className="w-full bg-primary text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-primary-dark transition-colors flex items-center justify-center gap-2 shadow-lg shadow-primary/20">
                  <DollarSign className="w-4 h-4" />
                  USD
                </button>
              </div>

              {/* Trip Time and Distance */}
              <div className="space-y-3">
                <div className="flex gap-2 text-slate-500 mb-3">
                  <Clock className="w-5 h-5" />
                  <ChevronRight className="w-5 h-5" />
                </div>

                <div>
                  <p className="text-sm text-slate-600 font-medium mb-1">Estimated Trip Time</p>
                  <p className="text-sm font-semibold text-slate-900">15 hours 19 mins</p>
                </div>

                <div>
                  <p className="text-sm text-slate-600 font-medium mb-1">Estimated Distance</p>
                  <p className="text-sm font-semibold text-slate-900">1,211 km</p>
                </div>
              </div>

              {/* Show Map Button */}
              <button className="w-full mt-6 bg-primary text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20">
                Show Map
              </button>
            </div>
          </div>

          {/* Right Content - Quotes List */}
          <div className="lg:col-span-3">
            {/* Page Title */}
            <h3 className="text-2xl font-serif text-slate-900 mb-6 text-center">
              Transfer quotes from Karachi to Lahore
            </h3>

            {/* Filters */}
            <div className="flex justify-between items-center mb-6 gap-4">
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-slate-700">Sort by:</label>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none border border-slate-300 rounded-lg px-4 py-2 pr-8 text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent cursor-pointer"
                  >
                    <option value="price-asc">Price Ascending</option>
                    <option value="price-desc">Price Descending</option>
                    <option value="rating">Rating</option>
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                </div>
              </div>

              <button className="flex items-center gap-2 border border-slate-300 rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors group">
                Round Trip Quote?
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            {/* Quotes */}
            <div className="space-y-4">
              {QUOTES.map((quote) => (
                <div
                  key={quote.id}
                  className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                    {/* Vehicle Info */}
                    <div className="md:col-span-1">
                      <p className="font-semibold text-slate-900 mb-1">
                        {quote.vehicle} {quote.type}
                      </p>
                      <p className="text-sm text-slate-600 mb-4">{quote.service}</p>

                      {/* Vehicle Image */}
                      <div className="mb-3 text-primary">
                        {quote.vehicle.includes("Sedan") && <Car className="w-16 h-16" />}
                        {quote.vehicle.includes("MPV") && <Truck className="w-16 h-16" />}
                        {quote.vehicle.includes("Minivan") && <Bus className="w-16 h-16" />}
                      </div>

                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-warning text-warning" />
                        ))}
                      </div>
                      <p className="text-xs text-slate-500 mt-1">Supplier Rating</p>
                    </div>

                    {/* Capacity Info */}
                    <div className="md:col-span-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-900">passengers {quote.passengers}</span>
                        <Users className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-900">medium {quote.medium}</span>
                        <Briefcase className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-900">small {quote.small}</span>
                        <Briefcase className="w-4 h-4 text-primary text-opacity-70" />
                      </div>

                      <button className="flex items-center gap-1 text-primary text-sm font-medium mt-2 hover:text-primary-dark">
                        <Info className="w-4 h-4" />
                        Transfer Info
                      </button>
                    </div>

                    {/* Cancellation and Price */}
                    <div className="md:col-span-1">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                        <Check className="w-3 h-3" />
                        {quote.cancellation}
                      </span>
                    </div>

                    {/* Pricing and CTA */}
                    <div className="md:col-span-1 text-right">
                      <p className="text-2xl font-bold text-primary mb-1">USD {quote.price.toFixed(2)}</p>
                      <p className="text-sm text-slate-600 mb-4">One Way</p>
                      <button className="w-full bg-primary text-white px-4 py-3 rounded-lg font-medium hover:bg-primary-dark transition-colors flex items-center justify-center gap-2 shadow-lg shadow-primary/20">
                        Book Now
                        <CircleArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
