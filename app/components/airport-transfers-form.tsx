"use client";

import { useState, useCallback, useEffect } from "react";
import { MapPin, Flag, Users, Calendar, Clock, Check, Search, Loader2, RotateCcw, Route, Timer, ChevronDown } from "lucide-react";
import { LocationAutocomplete } from "./location-autocomplete";
import { TomTomLocation, calculateRoute, RouteInfo } from "@/lib/tomtom";
import Skeleton from "./Skeleton";

interface SearchData {
    pickupLocation: string
    dropoffLocation: string
    pickupDate: string
    pickupTime: string
    returnDate?: string
    returnTime?: string
    passengers?: string
    mode: "transfer" | "rental"
    // New fields for route info
    estimatedDistance?: string
    estimatedDuration?: string
    pickupCoords?: { lat: number; lon: number }
    dropoffCoords?: { lat: number; lon: number }
}

interface AirportTransfersFormProps {
    onSearch?: (data: SearchData) => void
    isLoading?: boolean
}

export default function AirportTransfersForm({ onSearch, isLoading = false }: AirportTransfersFormProps) {
    const [pickUp, setPickUp] = useState("");
    const [dropOff, setDropOff] = useState("");
    const [pickupLocation, setPickupLocation] = useState<TomTomLocation | null>(null);
    const [dropoffLocation, setDropoffLocation] = useState<TomTomLocation | null>(null);
    const [passengers, setPassengers] = useState("1");
    const [date, setDate] = useState("2026-01-15");
    const [time, setTime] = useState("12:00");
    const [hasReturn, setHasReturn] = useState(false);
    const [returnDate, setReturnDate] = useState("");
    const [returnTime, setReturnTime] = useState("12:00");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Route calculation state
    const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
    const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);

    // Calculate route when both locations are selected
    const calculateRouteInfo = useCallback(async () => {
        if (!pickupLocation || !dropoffLocation) {
            setRouteInfo(null);
            return;
        }

        setIsCalculatingRoute(true);
        try {
            const route = await calculateRoute(
                pickupLocation.position,
                dropoffLocation.position,
                { travelMode: 'car', traffic: true }
            );
            setRouteInfo(route);
        } catch (error) {
            console.error("Error calculating route:", error);
            setRouteInfo(null);
        } finally {
            setIsCalculatingRoute(false);
        }
    }, [pickupLocation, dropoffLocation]);

    // Recalculate route when locations change
    useEffect(() => {
        calculateRouteInfo();
    }, [calculateRouteInfo]);

    // Handle pickup location selection
    const handlePickupSelect = useCallback((location: TomTomLocation) => {
        setPickupLocation(location);
    }, []);

    // Handle dropoff location selection
    const handleDropoffSelect = useCallback((location: TomTomLocation) => {
        setDropoffLocation(location);
    }, []);

    const handleSearch = () => {
        if (!pickUp || !dropOff) return;

        setIsSubmitting(true);

        // Simulate a brief loading state for better UX
        setTimeout(() => {
            if (onSearch) {
                onSearch({
                    pickupLocation: pickUp,
                    dropoffLocation: dropOff,
                    pickupDate: date,
                    pickupTime: time,
                    returnDate: hasReturn ? returnDate : undefined,
                    returnTime: hasReturn ? returnTime : undefined,
                    passengers,
                    mode: "transfer",
                    // Include route info
                    estimatedDistance: routeInfo ? `${routeInfo.distanceKm} km` : undefined,
                    estimatedDuration: routeInfo?.durationFormatted,
                    pickupCoords: pickupLocation?.position,
                    dropoffCoords: dropoffLocation?.position,
                });
            }
            setIsSubmitting(false);
        }, 300);
    };

    const isFormValid = pickUp.length > 0 && dropOff.length > 0;

    if (isLoading) {
        return (
            <div className="space-y-8 animate-pulse">
                {/* Route Info Skeleton (Placeholder space) */}
                <div className="h-20 bg-gray-50/50 rounded-2xl border border-gray-100" />

                {/* First Row Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <Skeleton className="w-20 h-4 rounded" />
                        <Skeleton className="w-full h-12 rounded-xl" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="w-20 h-4 rounded" />
                        <Skeleton className="w-full h-12 rounded-xl" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="w-20 h-4 rounded" />
                        <Skeleton className="w-full h-12 rounded-xl" />
                    </div>
                </div>

                {/* Second Row Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="space-y-2">
                        <Skeleton className="w-20 h-4 rounded" />
                        <Skeleton className="w-full h-12 rounded-xl" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="w-20 h-4 rounded" />
                        <Skeleton className="w-full h-12 rounded-xl" />
                    </div>
                    <div className="space-y-2 flex items-end">
                        <Skeleton className="w-full h-12 rounded-xl" />
                    </div>
                    <div className="space-y-2 flex items-end">
                        <Skeleton className="w-full h-12 rounded-xl" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Route Info Display - Shows when both locations selected */}
            {(routeInfo || isCalculatingRoute) && (
                <div className="bg-gradient-to-r from-primary/5 via-white to-secondary/5 rounded-2xl p-4 border border-primary/20 shadow-soft">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex flex-wrap items-center gap-4 sm:gap-6 w-full sm:w-auto">
                            <div className="flex items-center gap-2 min-w-[100px]">
                                <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                                    <Route className="w-5 h-5 text-primary" />
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Distance</p>
                                    {isCalculatingRoute ? (
                                        <Skeleton className="h-5 w-12 rounded mt-1" />
                                    ) : (
                                        <p className="font-bold text-gray-900 truncate">{routeInfo?.distanceKm} km</p>
                                    )}
                                </div>
                            </div>
                            <div className="hidden sm:block w-px h-10 bg-gray-200" />
                            <div className="flex items-center gap-2 min-w-[120px]">
                                <div className="p-2 bg-secondary/10 rounded-lg shrink-0">
                                    <Timer className="w-5 h-5 text-secondary" />
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Duration</p>
                                    {isCalculatingRoute ? (
                                        <Skeleton className="h-5 w-16 rounded mt-1" />
                                    ) : (
                                        <p className="font-bold text-gray-900 truncate">{routeInfo?.durationFormatted}</p>
                                    )}
                                </div>
                            </div>
                            {routeInfo && routeInfo.trafficDelaySeconds > 60 && (
                                <>
                                    <div className="hidden sm:block w-px h-10 bg-gray-200" />
                                    <div className="flex items-center gap-2 min-w-[110px]">
                                        <div className="p-2 bg-warning/10 rounded-lg shrink-0">
                                            <Clock className="w-5 h-5 text-warning" />
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Traffic</p>
                                            <p className="font-bold text-warning truncate">
                                                +{Math.round(routeInfo.trafficDelaySeconds / 60)} min
                                            </p>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1.5 bg-white/50 px-2 py-1 rounded-full border border-gray-100">
                            <span className="inline-block w-2 h-2 bg-success rounded-full animate-pulse" />
                            Live traffic
                        </div>
                    </div>
                </div>
            )}

            {/* First Row - Location and Passengers */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <LocationAutocomplete
                    value={pickUp}
                    onChange={setPickUp}
                    onLocationSelect={handlePickupSelect}
                    placeholder="Airport, hotel, address..."
                    icon={<MapPin className="w-4 h-4 text-primary" />}
                    label="Pick-Up Location"
                />

                <LocationAutocomplete
                    value={dropOff}
                    onChange={setDropOff}
                    onLocationSelect={handleDropoffSelect}
                    placeholder="Airport, hotel, address..."
                    icon={<Flag className="w-4 h-4 text-secondary" />}
                    label="Drop-Off Location"
                />

                <div className="form-field">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <span className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-accent" />
                            Passengers
                        </span>
                    </label>
                    <div className="relative">
                        <select
                            value={passengers}
                            onChange={(e) => setPassengers(e.target.value)}
                            className="select-premium w-full pr-10"
                        >
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                                <option key={num} value={num}>{num} {num === 1 ? 'Passenger' : 'Passengers'}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* Second Row - Date, Time, Add Return, Search */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="form-field">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <span className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-primary" />
                            Date
                        </span>
                    </label>
                    <input
                        type="date"
                        min={new Date().toLocaleDateString('en-CA')}
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 transition-all duration-200 input-glow"
                    />
                </div>

                <div className="form-field">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <span className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-secondary" />
                            Time
                        </span>
                    </label>
                    <input
                        type="time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 transition-all duration-200 input-glow"
                    />
                </div>

                <div className="flex items-end">
                    <button
                        onClick={() => setHasReturn(!hasReturn)}
                        className={`w-full px-4 py-3.5 border-2 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${hasReturn
                            ? 'border-primary bg-primary/10 text-primary-dark shadow-soft'
                            : 'border-gray-200 text-gray-600 hover:border-primary/50 hover:bg-primary/10/50'
                            }`}
                    >
                        {hasReturn ? (
                            <>
                                <Check className="w-4 h-4" />
                                Return Added
                            </>
                        ) : (
                            <>
                                <RotateCcw className="w-4 h-4" />
                                Add Return
                            </>
                        )}
                    </button>
                </div>

                <div className="flex items-end">
                    <button
                        onClick={handleSearch}
                        disabled={!isFormValid || isSubmitting}
                        className={`w-full py-3.5 font-semibold text-base rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${isFormValid && !isSubmitting
                            ? 'bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary-dark text-white shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-0.5'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Searching...
                            </>
                        ) : (
                            <>
                                <Search className="w-5 h-5" />
                                Search
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Return Trip Fields - Animated */}
            <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 overflow-hidden transition-all duration-500 ease-out ${hasReturn ? 'max-h-40 opacity-100 mt-6' : 'max-h-0 opacity-0 mt-0'
                }`}>
                <div className="form-field">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <span className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-primary" />
                            Return Date
                        </span>
                    </label>
                    <input
                        type="date"
                        min={new Date().toLocaleDateString('en-CA')}
                        value={returnDate}
                        onChange={(e) => setReturnDate(e.target.value)}
                        className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 transition-all duration-200 input-glow"
                    />
                </div>

                <div className="form-field">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <span className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-secondary" />
                            Return Time
                        </span>
                    </label>
                    <input
                        type="time"
                        value={returnTime}
                        onChange={(e) => setReturnTime(e.target.value)}
                        className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 transition-all duration-200 input-glow"
                    />
                </div>
            </div>
        </div>
    );
}