"use client"

import { Users, Route, Briefcase, Gauge, Plane, Shield, FileText, Check, ArrowRight, Loader2 } from "lucide-react"
import { ALL_CURRENCIES, convertPrice } from "@/lib/currency"

interface CarCardProps {
  car: {
    id: string
    name: string
    category: string
    image: string
    seats: number
    bags: number
    transmission: string
    price: number
    pricePerDay: number
    description: string
    fuelType: string
    pickupLocation: string
    features: string[]
  }
  onSelect: () => void
  isSelected?: boolean
  currency?: string
  exchangeRates?: any
}

export function CarCard({ car, onSelect, isSelected = false, currency = "USD", exchangeRates }: CarCardProps) {
  const currencySymbol = ALL_CURRENCIES.find(c => c.code === currency)?.symbol || currency;
  return (
    <div
      className={`relative bg-white rounded-2xl p-6 border-2 transition-all duration-400 card-hover ${isSelected
        ? 'border-secondary shadow-glow-secondary scale-[1.01]'
        : 'border-gray-100 hover:border-secondary/30 shadow-medium hover:shadow-hard'
        }`}
    >
      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-secondary to-secondary-dark rounded-xl flex items-center justify-center text-white animate-scale-in shadow-lg">
          <Check className="w-4 h-4" strokeWidth={3} />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Car Image */}
        <div className="md:col-span-1 flex items-center justify-center">
          <div className="relative group">
            <img
              src={car.image || "/placeholder.svg"}
              alt={car.name}
              className="w-full h-40 object-contain transition-transform duration-500 group-hover:scale-110"
            />
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
          </div>
        </div>

        {/* Car Info */}
        <div className="md:col-span-2">
          <div className="mb-4">
            <h3 className="text-xl font-bold text-gray-900 mb-1">{car.name}</h3>
            <p className="text-gray-500 text-sm font-medium">{car.category}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="flex items-center gap-3 p-3 bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl border border-gray-100">
              <div className="icon-container icon-container-md icon-container-secondary rounded-lg">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Seats</p>
                <p className="font-bold text-gray-900">{car.seats}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl border border-gray-100">
              <div className="icon-container icon-container-md icon-container-primary rounded-lg">
                <Route className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Per Rental</p>
                <p className="font-bold text-gray-900">400 Km</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl border border-gray-100">
              <div className="icon-container icon-container-md icon-container-accent rounded-lg">
                <Briefcase className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Bags</p>
                <p className="font-bold text-gray-900">{car.bags}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl border border-gray-100">
              <div className="icon-container icon-container-md icon-container-success rounded-lg">
                <Gauge className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Type</p>
                <p className="font-bold text-gray-900">{car.transmission}</p>
              </div>
            </div>
          </div>

          <div className="space-y-2.5 text-sm text-gray-600 mb-4">
            <div className="flex items-center gap-3">
              <div className="icon-container icon-container-sm icon-container-primary rounded-lg">
                <Plane className="w-3.5 h-3.5" />
              </div>
              <span className="font-medium">{car.pickupLocation}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="icon-container icon-container-sm icon-container-secondary rounded-lg">
                <Shield className="w-3.5 h-3.5" />
              </div>
              <span className="font-medium">{car.features[0]}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="icon-container icon-container-sm icon-container-accent rounded-lg">
                <FileText className="w-3.5 h-3.5" />
              </div>
              <span className="font-medium">{car.features[2]}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="badge badge-success">
              <Check className="w-3.5 h-3.5" />
              {car.description}
            </span>
            <a href="#" className="text-secondary hover:text-secondary-dark hover:underline text-sm font-semibold transition-colors inline-flex items-center gap-1">
              Important Info
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Pricing & Select */}
        <div className="md:col-span-1 flex flex-col justify-between">
          <div className="text-center md:text-right mb-4">
            <p className="text-gray-500 text-sm font-medium">From</p>
            <p className="text-3xl font-bold text-gray-900">
              {currencySymbol} {
                exchangeRates ?
                  Math.round(convertPrice(car.price, exchangeRates['USD'], exchangeRates[currency])).toLocaleString() :
                  car.price.toLocaleString()
              }
            </p>
            <p className="text-gray-500 text-sm mt-1">Total</p>
            <div className="inline-flex items-center gap-1 mt-2 px-3 py-1 bg-secondary/10 rounded-full">
              <p className="text-secondary-dark text-sm font-semibold">
                {currencySymbol} {
                  exchangeRates ?
                    Math.round(convertPrice(car.pricePerDay, exchangeRates['USD'], exchangeRates[currency])).toLocaleString() :
                    car.pricePerDay.toLocaleString()
                } / day
              </p>
            </div>
          </div>
          <button
            onClick={onSelect}
            disabled={isSelected}
            className={`w-full font-bold py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${isSelected
              ? 'bg-secondary/10 text-secondary-dark cursor-default border-2 border-secondary/30'
              : 'bg-gradient-to-r from-secondary to-secondary-dark hover:from-secondary-dark hover:to-secondary-dark text-white shadow-glow-secondary hover:shadow-lg hover:-translate-y-1'
              }`}
          >
            {isSelected ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Selecting...
              </>
            ) : (
              <>
                Select
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
