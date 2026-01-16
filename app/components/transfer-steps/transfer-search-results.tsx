"use client"

import { useState, useEffect, useRef } from "react"
import type { TransferBookingData, SelectedTransfer } from "../transfer-booking-form"
import {
    MapPin,
    Calendar,
    Clock,
    Users,
    Briefcase,
    Star,
    Info,
    Edit3,
    ArrowRight,
    RefreshCw,
    Route,
    Map,
    User,
    Loader2,
    ArrowUpDown,
    X,
    Check,
    Save,
    AlertCircle
} from "lucide-react"
import { LocationAutocomplete } from "../location-autocomplete"
import Skeleton from "../Skeleton"
import { useDomain } from "@/app/context/DomainContext"
import { ALL_CURRENCIES, getExchangeRates, convertPrice, formatCurrency } from "@/lib/currency"

interface TransferSearchResultsProps {
    bookingData: TransferBookingData
    onSelectTransfer: (transfer: SelectedTransfer) => void
    onEditQuote: () => void
    onUpdateCurrency: (currency: string) => void
    onUpdateBookingData?: (data: Partial<TransferBookingData>) => void
    isLoading?: boolean
    initialExchangeRates?: any
}

export function TransferSearchResults({
    bookingData,
    onSelectTransfer,
    onEditQuote,
    onUpdateCurrency,
    onUpdateBookingData,
    isLoading = false,
    initialExchangeRates
}: TransferSearchResultsProps) {
    const [sortBy, setSortBy] = useState<string>("price_asc")
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [showRoundTrip, setShowRoundTrip] = useState(false)
    const [showMapModal, setShowMapModal] = useState(false)
    const [mapLoading, setMapLoading] = useState(false)
    const mapContainerRef = useRef<HTMLDivElement>(null)
    const mapInstanceRef = useRef<any>(null)
    const { domainConfig, loading: domainLoading } = useDomain()

    // Transfer cars from MongoDB
    const [transfers, setTransfers] = useState<SelectedTransfer[]>([])
    const [loadingTransfers, setLoadingTransfers] = useState(true)
    const [transferError, setTransferError] = useState<string | null>(null)

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
        if (exchangeRates) return;

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

    // Fetch transfer cars from MongoDB
    useEffect(() => {
        const fetchTransfers = async () => {
            // Wait for domain loading
            if (domainLoading) return;

            try {
                setLoadingTransfers(true)
                setTransferError(null)
                const response = await fetch('/api/cars?carType=transfer&isActive=true')
                const result = await response.json()

                if (result.success && result.data) {
                    let filteredCars = result.data;

                    // If domain config exists, filter and override prices
                    if (domainConfig) {
                        console.log('Applying domain config for:', domainConfig.domainName);
                        console.log('Domain cars config:', domainConfig.cars);

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
                                    price: (carConfig && carConfig.price) ? carConfig.price : car.price
                                };
                            });
                    }

                    // Map MongoDB data to SelectedTransfer format
                    const mappedTransfers: SelectedTransfer[] = filteredCars.map((car: any) => ({
                        id: car._id.toString(),
                        name: car.name,
                        type: car.type,
                        image: car.image,
                        passengers: car.passengers,
                        mediumLuggage: car.mediumLuggage,
                        smallLuggage: car.smallLuggage,
                        price: car.price,
                        currency: car.currency || 'USD',
                        rating: car.rating,
                        cancellationPolicy: car.cancellationPolicy
                    }))
                    setTransfers(mappedTransfers)
                } else {
                    setTransferError('Failed to load transfer vehicles')
                }
            } catch (error) {
                console.error('Error fetching transfers:', error)
                setTransferError('Error connecting to server')
            } finally {
                setLoadingTransfers(false)
            }
        }

        fetchTransfers()
    }, [domainConfig, domainLoading])

    // Inline edit mode state
    const [isEditMode, setIsEditMode] = useState(false)
    const [editFormData, setEditFormData] = useState({
        fromLocation: bookingData.fromLocation,
        toLocation: bookingData.toLocation,
        date: bookingData.date,
        pickupTime: bookingData.pickupTime,
        passengers: bookingData.passengers
    })
    const [isSaving, setIsSaving] = useState(false)

    // Initialize TomTom map when modal opens
    useEffect(() => {
        if (!showMapModal || !mapContainerRef.current) return

        const initMap = async () => {
            setMapLoading(true)

            // Dynamically load TomTom SDK if not already loaded
            if (!(window as any).tt) {
                const script = document.createElement('script')
                script.src = 'https://api.tomtom.com/maps-sdk-for-web/cdn/6.x/6.25.0/maps/maps-web.min.js'
                script.async = true
                document.head.appendChild(script)

                const link = document.createElement('link')
                link.rel = 'stylesheet'
                link.href = 'https://api.tomtom.com/maps-sdk-for-web/cdn/6.x/6.25.0/maps/maps.css'
                document.head.appendChild(link)

                await new Promise<void>((resolve) => {
                    script.onload = () => resolve()
                })
            }

            const tt = (window as any).tt
            const apiKey = process.env.NEXT_PUBLIC_TOMTOM_API_KEY

            if (!apiKey || !mapContainerRef.current) {
                setMapLoading(false)
                return
            }

            // Clear previous map instance
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove()
            }

            // Default coordinates (center of route or fallback)
            const fromCoords = bookingData.fromCoords || { lat: 24.8607, lon: 67.0011 } // Karachi default
            const toCoords = bookingData.toCoords || { lat: 31.5497, lon: 74.3436 } // Lahore default

            const centerLat = (fromCoords.lat + toCoords.lat) / 2
            const centerLon = (fromCoords.lon + toCoords.lon) / 2

            // Create map
            const map = tt.map({
                key: apiKey,
                container: mapContainerRef.current,
                center: [centerLon, centerLat],
                zoom: 5,
                style: 'https://api.tomtom.com/style/1/style/22.2.1-*?map=basic_main&poi=poi_main'
            })

            mapInstanceRef.current = map

            map.on('load', async () => {
                // Add start marker
                new tt.Marker({ color: '#14b8a6' })
                    .setLngLat([fromCoords.lon, fromCoords.lat])
                    .setPopup(new tt.Popup().setHTML(`<div class="font-semibold text-gray-800">${bookingData.fromLocation}</div>`))
                    .addTo(map)

                // Add end marker
                new tt.Marker({ color: '#3b82f6' })
                    .setLngLat([toCoords.lon, toCoords.lat])
                    .setPopup(new tt.Popup().setHTML(`<div class="font-semibold text-gray-800">${bookingData.toLocation}</div>`))
                    .addTo(map)

                // Fetch and draw route
                try {
                    const routeUrl = `https://api.tomtom.com/routing/1/calculateRoute/${fromCoords.lat},${fromCoords.lon}:${toCoords.lat},${toCoords.lon}/json?key=${apiKey}&traffic=true`
                    const response = await fetch(routeUrl)
                    const data = await response.json()

                    if (data.routes && data.routes[0]) {
                        const route = data.routes[0]
                        const coordinates = route.legs[0].points.map((point: any) => [point.longitude, point.latitude])

                        map.addLayer({
                            id: 'route',
                            type: 'line',
                            source: {
                                type: 'geojson',
                                data: {
                                    type: 'Feature',
                                    properties: {},
                                    geometry: {
                                        type: 'LineString',
                                        coordinates: coordinates
                                    }
                                }
                            },
                            paint: {
                                'line-color': '#14b8a6',
                                'line-width': 5,
                                'line-opacity': 0.8
                            }
                        })

                        // Fit map to route bounds
                        const bounds = new tt.LngLatBounds()
                        coordinates.forEach((coord: number[]) => bounds.extend(coord))
                        map.fitBounds(bounds, { padding: 50 })
                    }
                } catch (error) {
                    console.error('Error fetching route:', error)
                }

                setMapLoading(false)
            })
        }

        initMap()

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove()
                mapInstanceRef.current = null
            }
        }
    }, [showMapModal, bookingData])

    const handleBookNow = (transfer: SelectedTransfer) => {
        setSelectedId(transfer.id)
        setTimeout(() => {
            onSelectTransfer(transfer)
        }, 300)
    }

    const sortedTransfers = [...transfers].sort((a, b) => {
        if (sortBy === "price_asc") return a.price - b.price
        if (sortBy === "price_desc") return b.price - a.price
        if (sortBy === "rating") return b.rating - a.rating
        return 0
    })

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

    // Handle entering edit mode
    const handleEditClick = () => {
        setEditFormData({
            fromLocation: bookingData.fromLocation,
            toLocation: bookingData.toLocation,
            date: bookingData.date,
            pickupTime: bookingData.pickupTime,
            passengers: bookingData.passengers
        })
        setIsEditMode(true)
    }

    // Handle canceling edit
    const handleCancelEdit = () => {
        setIsEditMode(false)
        setEditFormData({
            fromLocation: bookingData.fromLocation,
            toLocation: bookingData.toLocation,
            date: bookingData.date,
            pickupTime: bookingData.pickupTime,
            passengers: bookingData.passengers
        })
    }

    // Handle saving edit
    const handleSaveEdit = async () => {
        setIsSaving(true)

        // Update the booking data with the new values
        if (onUpdateBookingData) {
            onUpdateBookingData({
                fromLocation: editFormData.fromLocation,
                toLocation: editFormData.toLocation,
                date: editFormData.date,
                pickupTime: editFormData.pickupTime,
                passengers: editFormData.passengers
            })
        }

        // Simulate a brief save delay for UX
        setTimeout(() => {
            setIsSaving(false)
            setIsEditMode(false)
        }, 500)
    }

    if (isLoading) {
        return (
            <div className="step-transition">
                <div className="text-center mb-8 animate-pulse">
                    <Skeleton className="h-10 w-3/4 mx-auto rounded" />
                </div>
                <div className="flex justify-between items-center mb-6 animate-pulse">
                    <Skeleton className="h-10 w-48 rounded-xl" />
                    <Skeleton className="h-10 w-48 rounded-xl" />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-pulse">
                    <div className="lg:col-span-1 space-y-4">
                        <Skeleton className="h-64 w-full rounded-2xl" />
                        <Skeleton className="h-20 w-full rounded-2xl" />
                        <Skeleton className="h-24 w-full rounded-2xl" />
                    </div>
                    <div className="lg:col-span-3 space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white border border-gray-100 rounded-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12">
                                <div className="md:col-span-8 p-5">
                                    <div className="flex items-start gap-4">
                                        <Skeleton className="w-36 h-24 rounded-xl" />
                                        <div className="flex-1 space-y-4">
                                            <Skeleton className="h-6 w-1/2 rounded" />
                                            <Skeleton className="h-4 w-1/4 rounded" />
                                            <Skeleton className="h-8 w-full rounded" />
                                        </div>
                                    </div>
                                </div>
                                <div className="md:col-span-4 bg-gray-50/50 p-5 border-l border-gray-100">
                                    <Skeleton className="h-full w-full rounded-xl" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="step-transition">
            {/* Title */}
            <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-white">
                    Transfer quotes from <span className="text-primary">{bookingData.fromLocation.split(',')[0]}</span> to <span className="text-primary">{bookingData.toLocation.split(',')[0]}</span>
                </h1>
            </div>

            {/* Sort and Round Trip */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <span className="text-gray-300 text-sm font-medium flex items-center gap-1.5 shrink-0">
                        <ArrowUpDown className="w-4 h-4" />
                        Sort by:
                    </span>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="select-sort flex-1 sm:flex-none"
                    >
                        <option value="price_asc">Price Ascending</option>
                        <option value="price_desc">Price Descending</option>
                        <option value="rating">Rating</option>
                    </select>
                </div>
                <button
                    onClick={() => setShowRoundTrip(!showRoundTrip)}
                    className={`w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 border-2 rounded-xl text-sm font-semibold transition-all duration-300 ${showRoundTrip
                        ? 'border-primary bg-primary/20 text-primary shadow-soft'
                        : 'border-white/20 text-gray-300 hover:bg-white/10 hover:border-white/30'
                        }`}
                >
                    <RefreshCw className="w-4 h-4" />
                    Round Trip Quote?
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar - Summary */}
                <div className="lg:col-span-1 space-y-4">
                    {/* Summary Card */}
                    <div className="glass-card-elevated rounded-2xl overflow-hidden">
                        <div className="p-4 border-b border-white/10 flex justify-between items-center">
                            <h3 className="font-bold text-white text-lg">
                                {isEditMode ? 'Edit Quote' : 'Summary'}
                            </h3>
                            {!isEditMode && (
                                <button
                                    onClick={handleEditClick}
                                    className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1.5"
                                >
                                    <Edit3 className="w-3.5 h-3.5" />
                                    Edit Quote
                                </button>
                            )}
                        </div>

                        {isEditMode ? (
                            /* Edit Mode Form */
                            <div className="p-4 space-y-4">
                                {/* From Location */}
                                <div className="space-y-1.5">
                                    <label className="text-gray-500 text-xs font-medium flex items-center gap-1">
                                        <MapPin className="w-3 h-3 text-primary" />
                                        From
                                    </label>
                                    <LocationAutocomplete
                                        value={editFormData.fromLocation}
                                        onChange={(value) => setEditFormData(prev => ({ ...prev, fromLocation: value }))}
                                        placeholder="Pickup location"
                                    />
                                </div>

                                {/* To Location */}
                                <div className="space-y-1.5">
                                    <label className="text-gray-500 text-xs font-medium flex items-center gap-1">
                                        <MapPin className="w-3 h-3 text-secondary" />
                                        To
                                    </label>
                                    <LocationAutocomplete
                                        value={editFormData.toLocation}
                                        onChange={(value) => setEditFormData(prev => ({ ...prev, toLocation: value }))}
                                        placeholder="Dropoff location"
                                    />
                                </div>

                                {/* Date */}
                                <div className="space-y-1.5">
                                    <label className="text-gray-500 text-xs font-medium flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        Date
                                    </label>
                                    <input
                                        type="date"
                                        min={new Date().toLocaleDateString('en-CA')}
                                        value={editFormData.date}
                                        onChange={(e) => setEditFormData(prev => ({ ...prev, date: e.target.value }))}
                                        className="w-full px-3 py-2 border-2 border-white/20 bg-white text-gray-900 rounded-xl text-sm font-medium focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    />
                                </div>

                                {/* Time */}
                                <div className="space-y-1.5">
                                    <label className="text-gray-500 text-xs font-medium flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        Pick-Up Time
                                    </label>
                                    <input
                                        type="time"
                                        value={editFormData.pickupTime}
                                        onChange={(e) => setEditFormData(prev => ({ ...prev, pickupTime: e.target.value }))}
                                        className="w-full px-3 py-2 border-2 border-white/20 bg-white text-gray-900 rounded-xl text-sm font-medium focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    />
                                </div>

                                {/* Passengers */}
                                <div className="space-y-1.5">
                                    <label className="text-gray-500 text-xs font-medium flex items-center gap-1">
                                        <Users className="w-3 h-3" />
                                        Passengers
                                    </label>
                                    <select
                                        value={editFormData.passengers}
                                        onChange={(e) => setEditFormData(prev => ({ ...prev, passengers: parseInt(e.target.value) }))}
                                        className="select-premium w-full bg-white text-gray-900"
                                    >
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                                            <option key={num} value={num}>{num} {num === 1 ? 'Passenger' : 'Passengers'}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-2 pt-2">
                                    <button
                                        onClick={handleCancelEdit}
                                        className="flex-1 py-2.5 px-3 border-2 border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all flex items-center justify-center gap-1.5"
                                    >
                                        <X className="w-4 h-4" />
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSaveEdit}
                                        disabled={isSaving}
                                        className="flex-1 btn-primary py-2.5 px-3 text-sm flex items-center justify-center gap-1.5"
                                    >
                                        {isSaving ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Check className="w-4 h-4" />
                                                Save Changes
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            /* View Mode */
                            <div className="p-4 space-y-4">
                                <div className="flex items-start gap-3 text-sm">
                                    <div className="icon-container icon-container-sm icon-container-primary rounded-lg mt-0.5">
                                        <MapPin className="w-3.5 h-3.5" />
                                    </div>
                                    <div className="flex-1 space-y-3">
                                        <div>
                                            <p className="text-gray-400 text-xs font-medium">From</p>
                                            <p className="text-white font-semibold">{bookingData.fromLocation}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-400 text-xs font-medium">To</p>
                                            <p className="text-white font-semibold">{bookingData.toLocation}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-400 text-xs font-medium flex items-center gap-1">
                                                <Calendar className="w-3 h-3" /> Date
                                            </p>
                                            <p className="text-white font-semibold">{formatDate(bookingData.date)}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-400 text-xs font-medium flex items-center gap-1">
                                                <Clock className="w-3 h-3" /> Pick-Up Time
                                            </p>
                                            <p className="text-white font-semibold">{bookingData.pickupTime}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-400 text-xs font-medium flex items-center gap-1">
                                                <Users className="w-3 h-3" /> Passengers
                                            </p>
                                            <p className="text-white font-semibold">{bookingData.passengers}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Currency Selector */}
                    <div className="glass-card-elevated rounded-2xl p-4">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-300 text-sm font-medium">Change Currency</span>
                            <select
                                value={bookingData.currency}
                                onChange={(e) => onUpdateCurrency(e.target.value)}
                                className="select-accent max-w-[120px]"
                            >
                                {ALL_CURRENCIES.map(curr => (
                                    <option key={curr.code} value={curr.code}>
                                        {curr.code} - {curr.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Estimated Info */}
                    <div className="glass-card-elevated rounded-2xl p-4 space-y-3">
                        <div className="flex items-center gap-3 text-sm">
                            <div className="icon-container icon-container-sm icon-container-secondary rounded-lg">
                                <Clock className="w-3.5 h-3.5" />
                            </div>
                            <div>
                                <p className="text-primary text-xs font-medium">Estimated Trip Time</p>
                                <p className="text-white font-bold">{bookingData.estimatedTime}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <div className="icon-container icon-container-sm icon-container-purple rounded-lg">
                                <Route className="w-3.5 h-3.5" />
                            </div>
                            <div>
                                <p className="text-primary text-xs font-medium">Estimated Distance</p>
                                <p className="text-white font-bold">{bookingData.estimatedDistance}</p>
                            </div>
                        </div>
                    </div>

                    {/* Route / Map */}
                    <div className="glass-card-elevated rounded-2xl p-4">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-300 text-sm font-medium">Route</span>
                            <button
                                onClick={() => setShowMapModal(true)}
                                className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5"
                            >
                                <Map className="w-3.5 h-3.5" />
                                Show Map
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Content - Vehicle Cards */}
                <div className="lg:col-span-3 space-y-4">
                    {loadingTransfers ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="bg-white border border-gray-100 rounded-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12">
                                    {/* Vehicle Info Skeleton */}
                                    <div className="md:col-span-8 p-5">
                                        <div className="flex items-start gap-4">
                                            {/* Image */}
                                            <Skeleton className="flex-shrink-0 w-36 h-24 rounded-xl" />

                                            {/* Details */}
                                            <div className="flex-1 space-y-4">
                                                <div className="flex justify-between">
                                                    <div className="space-y-2 w-1/2">
                                                        <Skeleton className="h-6 w-3/4 rounded-lg" />
                                                        <Skeleton className="h-4 w-1/2 rounded" />
                                                    </div>
                                                    <div className="space-y-2 flex flex-col items-end">
                                                        <Skeleton className="h-4 w-24 rounded" />
                                                        <Skeleton className="h-4 w-20 rounded" />
                                                        <Skeleton className="h-4 w-20 rounded" />
                                                    </div>
                                                </div>
                                                <div className="flex justify-between items-center mt-4">
                                                    <Skeleton className="h-5 w-32 rounded" />
                                                    <Skeleton className="h-5 w-24 rounded" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Price & Book Skeleton */}
                                    <div className="md:col-span-4 bg-gray-50/50 p-5 flex flex-col justify-between border-l border-gray-100">
                                        <div className="space-y-2">
                                            <Skeleton className="h-6 w-32 rounded-full" />
                                            <Skeleton className="h-8 w-3/4 rounded-lg" />
                                            <Skeleton className="h-4 w-16 rounded" />
                                        </div>
                                        <Skeleton className="h-12 w-full rounded-xl mt-4" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : transferError ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="p-4 bg-red-50 rounded-2xl mb-4">
                                <AlertCircle className="w-12 h-12 text-red-400" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-800 mb-2">Failed to Load Vehicles</h3>
                            <p className="text-gray-500 mb-4">{transferError}</p>
                            <button
                                onClick={() => window.location.reload()}
                                className="px-4 py-2 bg-primary/50 text-white rounded-xl font-medium hover:bg-primary-dark transition-colors"
                            >
                                Try Again
                            </button>
                        </div>
                    ) : sortedTransfers.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="p-4 bg-gray-50 rounded-2xl mb-4">
                                <User className="w-12 h-12 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-800 mb-2">No Vehicles Available</h3>
                            <p className="text-gray-500">No transfer vehicles found. Please contact support or try again later.</p>
                        </div>
                    ) : (
                        sortedTransfers.map((transfer, index) => (
                            <TransferCard
                                key={transfer.id}
                                transfer={transfer}
                                currency={bookingData.currency}
                                exchangeRates={exchangeRates}
                                isSelected={selectedId === transfer.id}
                                onBookNow={() => handleBookNow(transfer)}
                                animationDelay={index * 0.1}
                            />
                        ))
                    )}
                </div>
            </div>

            {/* Map Modal */}
            {showMapModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
                        onClick={() => setShowMapModal(false)}
                    />

                    {/* Modal */}
                    <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden animate-scale-in">
                        {/* Header */}
                        <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gradient-to-r from-primary/5 to-secondary/5">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-gradient-to-br from-primary to-primary-dark rounded-xl shadow-lg shadow-primary/30">
                                    <Route className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-800 text-lg">Route Map</h3>
                                    <p className="text-gray-500 text-sm">
                                        {bookingData.fromLocation.split(',')[0]} → {bookingData.toLocation.split(',')[0]}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowMapModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        {/* Map Container */}
                        <div className="relative h-[500px] bg-gray-100">
                            {mapLoading && (
                                <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
                                    <div className="flex flex-col items-center gap-3">
                                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                                        <p className="text-gray-600 font-medium">Loading map...</p>
                                    </div>
                                </div>
                            )}
                            <div ref={mapContainerRef} className="w-full h-full" />
                        </div>

                        {/* Footer with Route Info */}
                        <div className="p-5 border-t border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100/50">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-6">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-primary/50" />
                                        <span className="text-sm text-gray-600">
                                            <span className="font-semibold text-gray-800">From:</span> {bookingData.fromLocation.split(',')[0]}
                                        </span>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-gray-400" />
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-red-500" />
                                        <span className="text-sm text-gray-600">
                                            <span className="font-semibold text-gray-800">To:</span> {bookingData.toLocation.split(',')[0]}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 text-sm">
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="w-4 h-4 text-primary" />
                                        <span className="font-semibold text-gray-800">{bookingData.estimatedTime}</span>
                                    </div>
                                    <div className="w-px h-4 bg-gray-300" />
                                    <div className="flex items-center gap-1.5">
                                        <Route className="w-4 h-4 text-primary" />
                                        <span className="font-semibold text-gray-800">{bookingData.estimatedDistance}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

interface TransferCardProps {
    transfer: SelectedTransfer
    currency: string
    exchangeRates: any
    isSelected: boolean
    onBookNow: () => void
    animationDelay: number
}

function TransferCard({ transfer, currency, exchangeRates, isSelected, onBookNow, animationDelay }: TransferCardProps) {
    return (
        <div
            className={`glass-card-elevated border-2 rounded-2xl overflow-hidden transition-all duration-300 animate-fade-in ${isSelected ? 'border-primary shadow-glow-primary' : 'border-white/10 hover:shadow-medium hover:border-white/20'
                }`}
            style={{ animationDelay: `${animationDelay}s` }}
        >
            <div className="grid grid-cols-1 md:grid-cols-12">
                {/* Vehicle Info */}
                <div className="md:col-span-8 p-4 sm:p-5">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
                        {/* Vehicle Image */}
                        <div className="flex-shrink-0 w-32 h-24 sm:w-36 sm:h-24 bg-gradient-to-br from-white/10 to-white/5 rounded-xl flex items-center justify-center border border-white/10">
                            <img
                                src={transfer.image || "/placeholder-car.png"}
                                alt={transfer.name}
                                className="w-full h-full object-contain p-2"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = "/compact-car-city.png"
                                }}
                            />
                        </div>

                        {/* Vehicle Details */}
                        <div className="flex-1 w-full text-center sm:text-left">
                            <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
                                <div>
                                    <h3 className="font-bold text-white text-lg sm:text-xl">{transfer.name}</h3>
                                    <p className="text-primary text-sm font-bold uppercase tracking-widest">{transfer.type}</p>
                                </div>
                                {/* Capacity indicators */}
                                <div className="flex sm:flex-col items-center sm:items-end flex-wrap justify-center gap-2 text-[10px] sm:text-xs">
                                    <div className="flex items-center gap-1.5 bg-success/5 text-success px-2 py-1 rounded-lg border border-success/10">
                                        <span className="font-bold uppercase tracking-tighter">{transfer.passengers} pax</span>
                                        <User className="w-3.5 h-3.5" />
                                    </div>
                                    <div className="flex items-center gap-1.5 bg-primary/5 text-primary px-2 py-1 rounded-lg border border-primary/10">
                                        <span className="font-bold uppercase tracking-tighter">{transfer.mediumLuggage} med</span>
                                        <Briefcase className="w-3.5 h-3.5" />
                                    </div>
                                    <div className="flex items-center gap-1.5 bg-secondary/10 text-secondary px-2 py-1 rounded-lg border border-secondary/20">
                                        <span className="font-bold uppercase tracking-tighter">{transfer.smallLuggage} sml</span>
                                        <Briefcase className="w-3.5 h-3.5" />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Supplier</span>
                                    <div className="flex">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`w-3.5 h-3.5 ${i < Math.floor(transfer.rating) ? 'text-warning fill-warning' : 'text-gray-200'}`}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <button className="text-primary hover:text-primary-dark text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 hover:underline decoration-2">
                                    <Info className="w-3.5 h-3.5" />
                                    Transfer Info
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Price & Book */}
                <div className="md:col-span-4 bg-gradient-to-br from-white/5 to-white/10 p-4 sm:p-5 flex flex-col justify-between border-t md:border-t-0 md:border-l border-white/10">
                    <div className="text-center md:text-left">
                        <p className="text-success text-[10px] font-bold uppercase tracking-widest mb-2 bg-success/10 px-2 py-1 rounded-full w-fit mx-auto md:mx-0 border border-success/20">{transfer.cancellationPolicy}</p>
                        <div className="flex items-baseline justify-center md:justify-start gap-1">
                            <span className="text-lg font-bold text-primary/70">{ALL_CURRENCIES.find(c => c.code === currency)?.symbol || currency}</span>
                            <span className="text-3xl font-black text-primary tracking-tight">
                                {
                                    exchangeRates ?
                                        Math.round(convertPrice(transfer.price, exchangeRates['USD'], exchangeRates[currency])).toLocaleString() :
                                        transfer.price.toLocaleString()
                                }
                            </span>
                        </div>
                        <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-1">Total One Way</p>
                    </div>
                    <button
                        onClick={onBookNow}
                        disabled={isSelected}
                        className={`w-full py-3.5 rounded-xl font-bold text-sm uppercase tracking-widest transition-all mt-4 flex items-center justify-center gap-2 ${isSelected
                            ? 'bg-primary/10 text-primary cursor-wait'
                            : 'bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary-dark text-white shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-0.5'
                            }`}
                    >
                        {isSelected ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Selecting...
                            </>
                        ) : (
                            <>
                                Book Now
                                <ArrowRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}
