
import Skeleton from "../Skeleton"
import { useDomain } from "@/app/context/DomainContext"

import { useState, useEffect } from "react"
import type { BookingData } from "../booking-form"
import { CarCard } from "./car-card"
import {
  ClipboardList,
  CheckCircle,
  Search,
  Wallet,
  Gauge,
  Car,
  Wind,
  ArrowUpDown,
  Star,
  TrendingUp,
  Loader2,
  AlertCircle,
  RefreshCw
} from "lucide-react"
import { ALL_CURRENCIES, getExchangeRates, convertPrice } from "@/lib/currency"

interface RentalCar {
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

interface SearchResultsProps {
  onSelectCar: (car: any) => void
  onUpdateCurrency?: (currency: string) => void
  bookingData: BookingData
  isLoading?: boolean
  initialExchangeRates?: any
}

type SortOption = "recommended" | "price" | "rating"

export function SearchResults({ onSelectCar, onUpdateCurrency, bookingData, isLoading = false, initialExchangeRates }: SearchResultsProps) {
  const [sortBy, setSortBy] = useState<SortOption>("recommended")
  const [selectedCarId, setSelectedCarId] = useState<string | null>(null)
  const { domainConfig, loading: domainLoading } = useDomain()

  // Rental cars from MongoDB
  const [cars, setCars] = useState<RentalCar[]>([])
  const [loadingCars, setLoadingCars] = useState(true)
  const [carError, setCarError] = useState<string | null>(null)

  // Currency Conversion
  const [exchangeRates, setExchangeRates] = useState<any>(initialExchangeRates || null)
  const [loadingRates, setLoadingRates] = useState(false)

  // Sync exchange rates if prop updates
  useEffect(() => {
    if (initialExchangeRates) {
      setExchangeRates(initialExchangeRates)
    }
  }, [initialExchangeRates])

  // Fetch exchange rates if not provided
  useEffect(() => {
    if (exchangeRates) return

    const fetchRates = async () => {
      setLoadingRates(true)
      const rates = await getExchangeRates('USD') // Base currency is USD
      if (rates) {
        setExchangeRates(rates)
      }
      setLoadingRates(false)
    }
    fetchRates()
  }, [exchangeRates])

  // Fetch rental cars from MongoDB
  useEffect(() => {
    const fetchCars = async () => {
      // Wait for domain loading
      if (domainLoading) return;

      try {
        setLoadingCars(true)
        setCarError(null)
        const response = await fetch('/api/cars?carType=rental&isActive=true')
        const result = await response.json()

        if (result.success && result.data) {
          let filteredCars = result.data;

          // If domain config exists, filter and override prices
          if (domainConfig) {
            filteredCars = result.data
              .filter((car: any) => {
                const carIdStr = car._id.toString();
                const carConfig = domainConfig.cars.find(c =>
                  c.carId === carIdStr || c.carId === car._id
                );

                // Show car if explicitly visible OR if not mentioned in config (default to show)
                return carConfig ? carConfig.isVisible : true;
              })
              .map((car: any) => {
                const carIdStr = car._id.toString();
                const carConfig = domainConfig.cars.find(c =>
                  c.carId === carIdStr || c.carId === car._id
                );
                return {
                  ...car,
                  price: (carConfig && carConfig.price) ? carConfig.price : car.price,
                  // For rental cars, price is often per day
                  pricePerDay: (carConfig && carConfig.price) ? carConfig.price : car.pricePerDay
                };
              });
          }

          // Map MongoDB data to RentalCar format
          const mappedCars: RentalCar[] = filteredCars.map((car: any) => ({
            id: car._id.toString(),
            name: car.name,
            category: car.category || '',
            image: car.image,
            seats: car.seats,
            bags: car.bags,
            transmission: car.transmission,
            price: car.price,
            pricePerDay: car.pricePerDay,
            description: car.description || 'Free Cancellation',
            fuelType: car.fuelType,
            pickupLocation: car.pickupLocation || '',
            features: car.features || []
          }))
          setCars(mappedCars)
        } else {
          setCarError('Failed to load rental cars')
        }
      } catch (error) {
        console.error('Error fetching rental cars:', error)
        setCarError('Error connecting to server')
      } finally {
        setLoadingCars(false)
      }
    }

    fetchCars()
  }, [domainConfig, domainLoading])

  const handleSelectCar = (car: any) => {
    setSelectedCarId(car.id)

    // Brief delay to show selection animation
    setTimeout(() => {
      onSelectCar({
        id: car.id,
        name: car.name,
        category: car.category,
        image: car.image,
        seats: car.seats,
        bags: car.bags,
        transmission: car.transmission,
        price: car.price,
        description: car.description,
        fuelType: car.fuelType,
        pickupLocation: car.pickupLocation,
        features: car.features,
      })
    }, 200)
  }

  const sortedCars = [...cars].sort((a, b) => {
    if (sortBy === "price") return a.price - b.price
    return 0 // Default order for recommended and rating
  })

  const getSortIcon = (option: SortOption) => {
    switch (option) {
      case "recommended":
        return <TrendingUp className="w-3.5 h-3.5" />
      case "price":
        return <ArrowUpDown className="w-3.5 h-3.5" />
      case "rating":
        return <Star className="w-3.5 h-3.5" />
    }
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-pulse">
        <div className="lg:col-span-1 space-y-6">
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
        <div className="lg:col-span-3">
          <Skeleton className="h-20 w-full rounded-2xl mb-6" />
          <div className="flex justify-between items-center mb-6">
            <Skeleton className="h-8 w-1/4 rounded" />
            <Skeleton className="h-10 w-1/3 rounded-xl" />
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white border border-gray-100 rounded-2xl p-6 grid grid-cols-1 md:grid-cols-4 gap-6">
                <Skeleton className="h-40 rounded-xl" />
                <div className="md:col-span-2 space-y-4">
                  <Skeleton className="h-8 w-1/2 rounded" />
                  <div className="grid grid-cols-2 gap-3">
                    <Skeleton className="h-12 rounded-lg" />
                    <Skeleton className="h-12 rounded-lg" />
                  </div>
                </div>
                <Skeleton className="h-32 rounded-xl" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 step-transition">
      {/* Sidebar */}
      <div className="lg:col-span-1 space-y-6">
        <TripSummary
          bookingData={bookingData}
          onUpdateCurrency={onUpdateCurrency}
        />
        <FilterSection />
      </div>

      {/* Main Content */}
      <div className="lg:col-span-3">
        {/* Success Banner */}
        <div className="bg-gradient-to-r from-success/10 to-primary/10 border border-success/20 rounded-2xl p-5 mb-6 flex items-center gap-4 shadow-soft animate-fade-in">
          <div className="w-12 h-12 bg-gradient-to-br from-success to-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-success/30">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-white font-semibold text-lg">Flexible cancellation with every booking</p>
            <p className="text-gray-300 text-sm mt-1">Free cancellation up to 48 hours before pick-up</p>
          </div>
        </div>

        {/* Sort Controls */}
        <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
          <p className="text-gray-300 font-medium">
            <span className="text-2xl font-bold text-white">{cars.length}</span> cars available
          </p>
          <div className="flex items-center gap-3">
            <span className="text-gray-300 font-medium">Sort by:</span>
            <div className="flex bg-white/10 rounded-xl p-1.5 shadow-soft border border-white/20">
              {(["recommended", "price", "rating"] as const).map((option) => (
                <button
                  key={option}
                  onClick={() => setSortBy(option)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 flex items-center gap-1.5 ${sortBy === option
                    ? "bg-gradient-to-r from-secondary to-secondary-dark text-white shadow-md"
                    : "text-gray-300 hover:bg-white/10"
                    }`}
                >
                  {getSortIcon(option)}
                  {option === "price" ? "Price ↑" : option.charAt(0).toUpperCase() + option.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Car Cards */}
        <div className="space-y-4">
          {loadingCars ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 grid grid-cols-1 md:grid-cols-4 gap-6">
                  {/* Image Skeleton */}
                  <div className="md:col-span-1 flex items-center justify-center">
                    <Skeleton className="w-full h-40 rounded-xl" />
                  </div>

                  {/* Info Skeleton */}
                  <div className="md:col-span-2 space-y-4">
                    <div>
                      <Skeleton className="h-8 w-1/2 mb-2 rounded-lg" />
                      <Skeleton className="h-4 w-1/4 rounded-md" />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {[1, 2, 3, 4].map((j) => (
                        <div key={j} className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl">
                          <Skeleton className="w-10 h-10 rounded-lg" />
                          <div className="space-y-1 flex-1">
                            <Skeleton className="h-3 w-1/2 rounded" />
                            <Skeleton className="h-4 w-3/4 rounded" />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <Skeleton className="h-4 w-2/3 rounded" />
                      <Skeleton className="h-4 w-1/2 rounded" />
                    </div>
                  </div>

                  {/* Price Skeleton */}
                  <div className="md:col-span-1 flex flex-col justify-between">
                    <div className="text-right flex flex-col items-end space-y-2">
                      <Skeleton className="h-4 w-10 rounded" />
                      <Skeleton className="h-10 w-3/4 rounded-lg" />
                      <Skeleton className="h-4 w-1/2 rounded" />
                      <Skeleton className="h-6 w-24 rounded-full" />
                    </div>
                    <Skeleton className="h-14 w-full rounded-xl mt-4" />
                  </div>
                </div>
              ))}
            </div>
          ) : carError ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="p-4 bg-red-50 rounded-2xl mb-4">
                <AlertCircle className="w-12 h-12 text-red-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Failed to Load Vehicles</h3>
              <p className="text-gray-500 mb-4">{carError}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : sortedCars.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="p-4 bg-gray-50 rounded-2xl mb-4">
                <Car className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">No Vehicles Available</h3>
              <p className="text-gray-500">No rental cars found. Please contact support or try again later.</p>
            </div>
          ) : (
            sortedCars.map((car, index) => (
              <div
                key={car.id}
                className={`animate-fade-in stagger-${index + 1}`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CarCard
                  car={car}
                  onSelect={() => handleSelectCar(car)}
                  isSelected={selectedCarId === car.id}
                  currency={bookingData.currency}
                  exchangeRates={exchangeRates}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

function TripSummary({ bookingData, onUpdateCurrency }: { bookingData: BookingData, onUpdateCurrency?: (currency: string) => void }) {
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
    <div className="glass-card-elevated rounded-2xl p-6 animate-fade-in">
      <h3 className="font-bold text-lg mb-4 text-white flex items-center gap-2">
        <div className="icon-container icon-container-sm icon-container-primary rounded-lg">
          <ClipboardList className="w-4 h-4" />
        </div>
        Trip Summary
      </h3>
      <div className="space-y-5">
        <div className="relative pl-6 border-l-2 border-primary/50">
          <div className="absolute -left-[9px] top-0 w-4 h-4 bg-gradient-to-br from-primary to-primary-dark rounded-full shadow-sm"></div>
          <p className="text-primary text-xs font-semibold uppercase tracking-wide">Pick-up</p>
          <p className="font-bold text-white mt-1">{bookingData.pickupLocation}</p>
          <p className="text-gray-300 font-semibold">{formatDate(bookingData.pickupDate)}</p>
          <p className="text-gray-400">{bookingData.pickupTime}</p>
        </div>
        <div className="relative pl-6 border-l-2 border-secondary/50">
          <div className="absolute -left-[9px] top-0 w-4 h-4 bg-gradient-to-br from-secondary to-secondary-dark rounded-full shadow-sm"></div>
          <p className="text-secondary text-xs font-semibold uppercase tracking-wide">Drop-off</p>
          <p className="font-bold text-white mt-1">{bookingData.dropoffLocation}</p>
          <p className="text-gray-300 font-semibold">{formatDate(bookingData.dropoffDate)}</p>
          <p className="text-gray-400">{bookingData.dropoffTime}</p>
        </div>
        <div className="pt-4 border-t border-white/10 flex justify-between items-center">
          <div>
            <p className="text-gray-400 text-sm font-medium">Currency</p>
            <p className="font-bold text-white">
              {ALL_CURRENCIES.find(c => c.code === bookingData.currency)?.symbol || ''} {bookingData.currency}
            </p>
          </div>
          {onUpdateCurrency && (
            <select
              value={bookingData.currency}
              onChange={(e) => onUpdateCurrency(e.target.value)}
              className="select-accent max-w-[100px] py-1.5"
            >
              {ALL_CURRENCIES.map(curr => (
                <option key={curr.code} value={curr.code}>
                  {curr.code}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>
    </div>
  )
}

function FilterSection() {
  return (
    <div className="glass-card-elevated rounded-2xl p-6 animate-fade-in stagger-2">
      <h3 className="font-bold text-lg mb-4 text-white flex items-center gap-2">
        <div className="icon-container icon-container-sm icon-container-secondary rounded-lg">
          <Search className="w-4 h-4" />
        </div>
        Filters
      </h3>

      <div className="mb-6">
        <button className="flex items-center gap-2 font-bold text-white mb-3 w-full hover:text-primary transition-colors">
          <Wallet className="w-4 h-4 text-gray-400" />
          Price Range
        </button>
        <p className="text-gray-300 text-sm mb-3">
          Average: <span className="font-bold text-white">₨ 241,264</span>
        </p>
        <div className="relative h-2.5 bg-gray-700/50 rounded-full overflow-hidden mb-2">
          <div className="absolute left-0 top-0 h-full w-3/4 bg-gradient-to-r from-primary/80 to-secondary/80 rounded-full" />
          <div className="absolute right-1/4 top-1/2 -translate-y-1/2 w-5 h-5 bg-white border-2 border-secondary rounded-full shadow-md cursor-pointer hover:scale-110 transition-transform" />
        </div>
        <div className="flex justify-between text-xs text-gray-400 font-medium">
          <span>₨ 73,002</span>
          <span>₨ 395,554+</span>
        </div>
      </div>

      <div className="mb-6">
        <button className="flex items-center gap-2 font-bold text-white mb-3 w-full hover:text-primary transition-colors">
          <Gauge className="w-4 h-4 text-gray-400" />
          Transmission
        </button>
        <label className="flex items-center gap-3 mb-2 cursor-pointer group">
          <input type="checkbox" defaultChecked className="w-5 h-5 rounded-lg border-gray-600 bg-gray-800 text-primary focus:ring-primary" />
          <span className="text-gray-300 group-hover:text-white transition-colors font-medium">Automatic</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer group">
          <input type="checkbox" className="w-5 h-5 rounded-lg border-gray-600 bg-gray-800 text-primary focus:ring-primary" />
          <span className="text-gray-300 group-hover:text-white transition-colors font-medium">Manual</span>
        </label>
      </div>

      <div>
        <button className="flex items-center gap-2 font-bold text-white mb-3 w-full hover:text-primary transition-colors">
          <Car className="w-4 h-4 text-gray-400" />
          Car Specs
        </button>
        <label className="flex items-center gap-3 cursor-pointer group">
          <input type="checkbox" defaultChecked className="w-5 h-5 rounded-lg border-gray-600 bg-gray-800 text-primary focus:ring-primary" />
          <span className="text-gray-300 group-hover:text-white transition-colors font-medium flex items-center gap-1.5">
            <Wind className="w-3.5 h-3.5 text-gray-400" />
            Air Conditioning
          </span>
        </label>
      </div>
    </div>
  )
}
