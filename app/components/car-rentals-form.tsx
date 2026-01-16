"use client";

import { useState, useCallback } from "react";
import { MapPin, Flag, Calendar, Car, Search, Loader2, ChevronDown } from "lucide-react";
import { LocationAutocomplete } from "./location-autocomplete";
import { TomTomLocation } from "@/lib/tomtom";
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
    pickupCoords?: { lat: number; lon: number }
    dropoffCoords?: { lat: number; lon: number }
}

interface CarRentalsFormProps {
    onSearch?: (data: SearchData) => void
    isLoading?: boolean
}

export default function CarRentalsForm({ onSearch, isLoading = false }: CarRentalsFormProps) {
    const [pickUpLocation, setPickUpLocation] = useState("");
    const [dropOffLocation, setDropOffLocation] = useState("");
    const [pickupLocationData, setPickupLocationData] = useState<TomTomLocation | null>(null);
    const [dropoffLocationData, setDropoffLocationData] = useState<TomTomLocation | null>(null);
    const [differentLocation, setDifferentLocation] = useState(false);
    const [pickUpDate, setPickUpDate] = useState("2026-01-15");
    const [pickUpTime, setPickUpTime] = useState("10:00");
    const [returnDate, setReturnDate] = useState("2026-01-19");
    const [returnTime, setReturnTime] = useState("10:00");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Handle pickup location selection
    const handlePickupSelect = useCallback((location: TomTomLocation) => {
        setPickupLocationData(location);
    }, []);

    // Handle dropoff location selection
    const handleDropoffSelect = useCallback((location: TomTomLocation) => {
        setDropoffLocationData(location);
    }, []);

    const handleSearch = () => {
        if (!pickUpLocation) return;

        setIsSubmitting(true);

        // Check if we should redirect to parent's booking page
        const urlParams = new URLSearchParams(window.location.search);
        const shouldRedirect = urlParams.get('redirectOnSearch') === 'true';

        if (shouldRedirect && window.parent !== window) {
            // Collect all form data
            const formData = {
                serviceType: 'car-rentals',
                pickupLocation: pickUpLocation,
                dropoffLocation: differentLocation ? dropOffLocation : pickUpLocation,
                pickupDate: pickUpDate,
                pickupTime: pickUpTime,
                returnDate: returnDate,
                returnTime: returnTime,
                mode: "rental" as const,
                pickupCoords: pickupLocationData?.position,
                dropoffCoords: differentLocation ? dropoffLocationData?.position : pickupLocationData?.position,
            };

            // Send message to parent window
            window.parent.postMessage({
                type: 'searchClicked',
                formData: formData
            }, '*');

            setIsSubmitting(false);
            return; // Don't continue with normal search
        }

        // Simulate a brief loading state for better UX
        setTimeout(() => {
            if (onSearch) {
                onSearch({
                    pickupLocation: pickUpLocation,
                    dropoffLocation: differentLocation ? dropOffLocation : pickUpLocation,
                    pickupDate: pickUpDate,
                    pickupTime: pickUpTime,
                    returnDate: returnDate,
                    returnTime: returnTime,
                    mode: "rental",
                    pickupCoords: pickupLocationData?.position,
                    dropoffCoords: differentLocation ? dropoffLocationData?.position : pickupLocationData?.position,
                });
            }
            setIsSubmitting(false);
        }, 300);
    };

    const isFormValid = pickUpLocation.length > 0 && (!differentLocation || dropOffLocation.length > 0);

    const timeOptions = [
        "00:00", "01:00", "02:00", "03:00", "04:00", "05:00",
        "06:00", "07:00", "08:00", "09:00", "10:00", "11:00",
        "12:00", "13:00", "14:00", "15:00", "16:00", "17:00",
        "18:00", "19:00", "20:00", "21:00", "22:00", "23:00"
    ];

    if (isLoading) {
        return (
            <div className="space-y-8 animate-pulse">
                {/* Pick-up Location Skeleton */}
                <div className="space-y-2">
                    <Skeleton className="w-40 h-4 rounded" />
                    <Skeleton className="w-full h-12 rounded-xl" />
                </div>

                {/* Checkbox Skeleton */}
                <div className="flex items-center gap-3">
                    <Skeleton className="w-12 h-7 rounded-full" />
                    <Skeleton className="w-48 h-4 rounded" />
                </div>

                {/* Date/Time Row Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Skeleton className="w-40 h-4 rounded" />
                        <div className="flex gap-2">
                            <Skeleton className="flex-1 h-12 rounded-xl" />
                            <Skeleton className="w-24 h-12 rounded-xl" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="w-40 h-4 rounded" />
                        <div className="flex gap-2">
                            <Skeleton className="flex-1 h-12 rounded-xl" />
                            <Skeleton className="w-24 h-12 rounded-xl" />
                        </div>
                    </div>
                </div>

                {/* Button Skeleton */}
                <div className="flex justify-center pt-4">
                    <Skeleton className="h-14 w-full md:w-96 rounded-xl" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Pick-up Location */}
            <LocationAutocomplete
                value={pickUpLocation}
                onChange={setPickUpLocation}
                onLocationSelect={handlePickupSelect}
                placeholder="City, airport, or address"
                icon={<MapPin className="w-4 h-4 text-primary" />}
                label="Pick-up Location"
            />

            {/* Return to Different Location Checkbox */}
            <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        checked={differentLocation}
                        onChange={(e) => setDifferentLocation(e.target.checked)}
                        className="sr-only peer"
                    />
                    <div className="w-12 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-[22px] after:w-[22px] after:transition-all after:shadow-sm peer-checked:bg-gradient-to-r peer-checked:from-primary peer-checked:to-primary-dark"></div>
                </label>
                <span className="text-sm text-gray-700 font-medium">Return to a different location</span>
            </div>

            {/* Different Drop-off Location - Animated */}
            <div className={`overflow-hidden transition-all duration-500 ease-out ${differentLocation ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
                }`}>
                <LocationAutocomplete
                    value={dropOffLocation}
                    onChange={setDropOffLocation}
                    onLocationSelect={handleDropoffSelect}
                    placeholder="City, airport, or address"
                    icon={<Flag className="w-4 h-4 text-secondary" />}
                    label="Drop-off Location"
                />
            </div>

            {/* Pick-up and Return Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-field">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <span className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-primary" />
                            Pick-up Date & Time
                        </span>
                    </label>
                    <div className="flex gap-2">
                        <div className="flex-1">
                            <input
                                type="date"
                                min={new Date().toLocaleDateString('en-CA')}
                                value={pickUpDate}
                                onChange={(e) => setPickUpDate(e.target.value)}
                                className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 transition-all duration-200 input-glow bg-white"
                            />
                        </div>
                        <div className="relative">
                            <select
                                value={pickUpTime}
                                onChange={(e) => setPickUpTime(e.target.value)}
                                className="select-premium w-full pr-10 bg-white"
                            >
                                {timeOptions.map(t => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary pointer-events-none" />
                        </div>
                    </div>
                </div>

                <div className="form-field">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <span className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-secondary" />
                            Return Date & Time
                        </span>
                    </label>
                    <div className="flex gap-2">
                        <div className="flex-1">
                            <input
                                type="date"
                                min={new Date().toLocaleDateString('en-CA')}
                                value={returnDate}
                                onChange={(e) => setReturnDate(e.target.value)}
                                className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 transition-all duration-200 input-glow bg-white"
                            />
                        </div>
                        <div className="relative">
                            <select
                                value={returnTime}
                                onChange={(e) => setReturnTime(e.target.value)}
                                className="select-premium w-full pr-10 bg-white"
                            >
                                {timeOptions.map(t => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary pointer-events-none" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Duration indicator */}
            {/* {pickUpDate && returnDate && (
                <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border border-primary/20 rounded-2xl p-4 flex items-center gap-4 animate-fade-in shadow-soft">
                    <div className="icon-container icon-container-lg icon-container-teal rounded-xl">
                        <Car className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-primary-dark font-bold">
                            {Math.ceil((new Date(returnDate).getTime() - new Date(pickUpDate).getTime()) / (1000 * 60 * 60 * 24))} days rental
                        </p>
                        <p className="text-primary text-sm font-medium">
                            Pick-up: {new Date(pickUpDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at {pickUpTime}
                        </p>
                    </div>
                </div>
            )} */}

            {/* Search Button */}
            <div className="flex justify-center pt-4">
                <button
                    onClick={handleSearch}
                    disabled={!isFormValid || isSubmitting}
                    className={`w-full md:w-96 py-4 font-bold text-lg rounded-xl transition-all duration-300 flex items-center justify-center gap-3 ${isFormValid && !isSubmitting
                        ? 'bg-gradient-to-r from-primary to-primary-dark hover:brightness-110 text-white shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-0.5 transform'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
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
                            Search Available Cars
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}