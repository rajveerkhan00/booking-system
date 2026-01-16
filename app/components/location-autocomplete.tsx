"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { MapPin, Loader2, X, Navigation } from "lucide-react";
import { getLocationSuggestions, TomTomLocation } from "@/lib/tomtom";
import Skeleton from "./Skeleton";

interface LocationAutocompleteProps {
    value: string;
    onChange: (value: string) => void;
    onLocationSelect?: (location: TomTomLocation) => void;
    placeholder?: string;
    icon?: React.ReactNode;
    iconColor?: string;
    label?: string;
    className?: string;
    inputClassName?: string;
    disabled?: boolean;
    countrySet?: string;
    debounceMs?: number;
}

export function LocationAutocomplete({
    value,
    onChange,
    onLocationSelect,
    placeholder = "Search for a location...",
    icon,
    iconColor = "text-primary",
    label,
    className = "",
    inputClassName = "",
    disabled = false,
    countrySet,
    debounceMs = 300,
}: LocationAutocompleteProps) {
    const [suggestions, setSuggestions] = useState<TomTomLocation[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const [selectedLocation, setSelectedLocation] = useState<TomTomLocation | null>(null);

    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    // Fetch suggestions with debouncing
    const fetchSuggestions = useCallback(async (query: string) => {
        if (query.trim().length < 2) {
            setSuggestions([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);

        try {
            const results = await getLocationSuggestions(query, {
                limit: 6,
                countrySet,
            });
            setSuggestions(results);
        } catch (error) {
            console.error("Error fetching location suggestions:", error);
            setSuggestions([]);
        } finally {
            setIsLoading(false);
        }
    }, [countrySet]);

    // Handle input change with debouncing
    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        onChange(newValue);
        setSelectedLocation(null);
        setShowSuggestions(true);
        setHighlightedIndex(-1);

        // Clear previous debounce
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        // Debounce the API call
        debounceRef.current = setTimeout(() => {
            fetchSuggestions(newValue);
        }, debounceMs);
    }, [onChange, fetchSuggestions, debounceMs]);

    // Handle location selection
    const handleSelectLocation = useCallback((location: TomTomLocation) => {
        const displayValue = location.freeformAddress || location.fullAddress;
        onChange(displayValue);
        setSelectedLocation(location);
        setSuggestions([]);
        setShowSuggestions(false);
        setHighlightedIndex(-1);

        if (onLocationSelect) {
            onLocationSelect(location);
        }
    }, [onChange, onLocationSelect]);

    // Handle keyboard navigation
    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!showSuggestions || suggestions.length === 0) return;

        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                setHighlightedIndex((prev) =>
                    prev < suggestions.length - 1 ? prev + 1 : prev
                );
                break;
            case "ArrowUp":
                e.preventDefault();
                setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
                break;
            case "Enter":
                e.preventDefault();
                if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
                    handleSelectLocation(suggestions[highlightedIndex]);
                }
                break;
            case "Escape":
                setShowSuggestions(false);
                setHighlightedIndex(-1);
                break;
        }
    }, [showSuggestions, suggestions, highlightedIndex, handleSelectLocation]);

    // Close suggestions when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
                setHighlightedIndex(-1);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Cleanup debounce on unmount
    useEffect(() => {
        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, []);

    // Clear button handler
    const handleClear = useCallback(() => {
        onChange("");
        setSelectedLocation(null);
        setSuggestions([]);
        setShowSuggestions(false);
        inputRef.current?.focus();
    }, [onChange]);

    // Get location type icon
    const getLocationTypeIcon = (type: string, category?: string) => {
        if (category?.toLowerCase().includes("airport")) {
            return "✈️";
        }
        if (category?.toLowerCase().includes("hotel")) {
            return "🏨";
        }
        if (type === "POI") {
            return "📍";
        }
        return "📍";
    };

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            {label && (
                <label className="block text-sm font-semibold text-white mb-2 shadow-black/50 drop-shadow-sm">
                    <span className="flex items-center gap-2">
                        {icon || <MapPin className={`w-4 h-4 ${iconColor}`} />}
                        {label}
                    </span>
                </label>
            )}

            <div className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    value={value}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => value.length >= 2 && suggestions.length > 0 && setShowSuggestions(true)}
                    placeholder={placeholder}
                    disabled={disabled}
                    className={`w-full px-4 py-3.5 pr-12 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-black bg-white placeholder-gray-500 transition-all duration-200 input-glow ${disabled ? "bg-gray-100 cursor-not-allowed" : ""
                        } ${inputClassName}`}
                />

                {/* Right side icons */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    {isLoading && (
                        <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                    )}
                    {value && !isLoading && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                            tabIndex={-1}
                        >
                            <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                        </button>
                    )}
                    {selectedLocation && (
                        <Navigation className="w-4 h-4 text-primary" />
                    )}
                </div>
            </div>

            {/* Suggestions dropdown */}
            {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-2 bg-white border-2 border-gray-100 rounded-xl shadow-xl overflow-hidden animate-fade-in">
                    <div className="py-2">
                        {suggestions.map((location, index) => (
                            <button
                                key={location.id}
                                type="button"
                                onClick={() => handleSelectLocation(location)}
                                onMouseEnter={() => setHighlightedIndex(index)}
                                className={`w-full px-4 py-3 text-left flex items-start gap-3 transition-colors ${highlightedIndex === index
                                    ? "bg-gradient-to-r from-primary/5 to-secondary/5"
                                    : "hover:bg-gray-50"
                                    }`}
                            >
                                <span className="text-lg mt-0.5">
                                    {getLocationTypeIcon(location.type, location.category)}
                                </span>
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium text-gray-900 truncate">
                                        {location.name}
                                    </div>
                                    <div className="text-sm text-gray-500 truncate">
                                        {location.freeformAddress || location.address}
                                    </div>
                                    {location.country && (
                                        <div className="text-xs text-gray-400 mt-0.5">
                                            {location.country}
                                        </div>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* TomTom Attribution */}
                    <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
                        <div className="flex items-center justify-end gap-1.5 text-xs text-gray-400">
                            <span>Powered by</span>
                            <span className="font-semibold text-gray-500">TomTom</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Loading Skeleton */}
            {isLoading && showSuggestions && (
                <div className="absolute z-50 w-full mt-2 bg-white border-2 border-gray-100 rounded-xl shadow-xl overflow-hidden animate-fade-in">
                    <div className="py-2">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="px-4 py-3 flex items-center gap-3">
                                <Skeleton className="w-6 h-6 rounded-full" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-4 w-3/4 rounded" />
                                    <Skeleton className="h-3 w-1/2 rounded" />
                                </div>
                            </div>
                        ))}
                    </div>
                    {/* TomTom Attribution Skeleton */}
                    <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 flex justify-end">
                        <Skeleton className="h-3 w-20 rounded" />
                    </div>
                </div>
            )}

            {/* No results message */}
            {showSuggestions && value.length >= 2 && !isLoading && suggestions.length === 0 && (
                <div className="absolute z-50 w-full mt-2 bg-white border-2 border-gray-100 rounded-xl shadow-xl overflow-hidden p-4">
                    <div className="text-center text-gray-500">
                        <MapPin className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm">No locations found</p>
                        <p className="text-xs text-gray-400 mt-1">Try a different search term</p>
                    </div>
                </div>
            )}
        </div>
    );
}

export default LocationAutocomplete;
