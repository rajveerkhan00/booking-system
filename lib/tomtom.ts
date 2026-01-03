// TomTom API Service for Location Search and Distance Calculation
// Uses NEXT_PUBLIC_TOMTOM_API_KEY from environment variables

const TOMTOM_API_KEY = process.env.NEXT_PUBLIC_TOMTOM_API_KEY;
const SEARCH_BASE_URL = 'https://api.tomtom.com/search/2';
const ROUTING_BASE_URL = 'https://api.tomtom.com/routing/1';

export interface TomTomLocation {
    id: string;
    name: string;
    address: string;
    fullAddress: string;
    position: {
        lat: number;
        lon: number;
    };
    type: string;
    category?: string;
    country?: string;
    countryCode?: string;
    municipality?: string;
    freeformAddress?: string;
}

export interface RouteInfo {
    distanceMeters: number;
    distanceKm: number;
    distanceMiles: number;
    durationSeconds: number;
    durationFormatted: string;
    trafficDelaySeconds: number;
    departureTime: string;
    arrivalTime: string;
}

export interface TomTomSearchResult {
    type: string;
    id: string;
    score: number;
    address: {
        streetNumber?: string;
        streetName?: string;
        municipalitySubdivision?: string;
        municipality?: string;
        countrySecondarySubdivision?: string;
        countryTertiarySubdivision?: string;
        countrySubdivision?: string;
        postalCode?: string;
        extendedPostalCode?: string;
        countryCode?: string;
        country?: string;
        countryCodeISO3?: string;
        freeformAddress?: string;
        localName?: string;
    };
    position: {
        lat: number;
        lon: number;
    };
    poi?: {
        name: string;
        categorySet?: { id: number }[];
        categories?: string[];
        classifications?: { code: string; names: { nameLocale: string; name: string }[] }[];
    };
}

/**
 * Search for places using TomTom Fuzzy Search API
 * @param query - Search query string
 * @param options - Optional search parameters
 * @returns Array of TomTomLocation results
 */
export async function searchPlaces(
    query: string,
    options?: {
        limit?: number;
        countrySet?: string;
        lat?: number;
        lon?: number;
        radius?: number;
        language?: string;
        typeahead?: boolean;
    }
): Promise<TomTomLocation[]> {
    if (!TOMTOM_API_KEY) {
        console.error('TomTom API key is not configured');
        return [];
    }

    if (!query || query.trim().length < 2) {
        return [];
    }

    try {
        const params = new URLSearchParams({
            key: TOMTOM_API_KEY,
            query: query.trim(),
            limit: String(options?.limit || 5),
            typeahead: String(options?.typeahead !== false),
            language: options?.language || 'en-US',
        });

        // Add optional location bias
        if (options?.lat && options?.lon) {
            params.append('lat', String(options.lat));
            params.append('lon', String(options.lon));
            if (options?.radius) {
                params.append('radius', String(options.radius));
            }
        }

        // Add country filter
        if (options?.countrySet) {
            params.append('countrySet', options.countrySet);
        }

        const response = await fetch(
            `${SEARCH_BASE_URL}/search/${encodeURIComponent(query)}.json?${params.toString()}`
        );

        if (!response.ok) {
            throw new Error(`TomTom API error: ${response.status}`);
        }

        const data = await response.json();

        return (data.results || []).map((result: TomTomSearchResult) => ({
            id: result.id,
            name: result.poi?.name || result.address.localName || result.address.municipality || 'Unknown',
            address: result.address.freeformAddress || '',
            fullAddress: formatFullAddress(result),
            position: result.position,
            type: result.type,
            category: result.poi?.categories?.[0] || '',
            country: result.address.country,
            countryCode: result.address.countryCode,
            municipality: result.address.municipality,
            freeformAddress: result.address.freeformAddress,
        }));
    } catch (error) {
        console.error('TomTom search error:', error);
        return [];
    }
}

/**
 * Get autocomplete suggestions for a location query
 * Optimized for typeahead with faster response
 */
export async function getLocationSuggestions(
    query: string,
    options?: {
        limit?: number;
        countrySet?: string;
    }
): Promise<TomTomLocation[]> {
    return searchPlaces(query, {
        ...options,
        limit: options?.limit || 5,
        typeahead: true,
    });
}

/**
 * Calculate route between two points using TomTom Routing API
 * Returns distance and duration information
 */
export async function calculateRoute(
    origin: { lat: number; lon: number },
    destination: { lat: number; lon: number },
    options?: {
        travelMode?: 'car' | 'truck' | 'taxi' | 'bus' | 'van' | 'motorcycle' | 'bicycle' | 'pedestrian';
        traffic?: boolean;
        departAt?: Date;
        avoid?: ('tollRoads' | 'motorways' | 'ferries' | 'unpavedRoads' | 'carpools' | 'alreadyUsedRoads')[];
    }
): Promise<RouteInfo | null> {
    if (!TOMTOM_API_KEY) {
        console.error('TomTom API key is not configured');
        return null;
    }

    try {
        const locations = `${origin.lat},${origin.lon}:${destination.lat},${destination.lon}`;

        const params = new URLSearchParams({
            key: TOMTOM_API_KEY,
            travelMode: options?.travelMode || 'car',
            traffic: String(options?.traffic !== false),
            routeType: 'fastest',
        });

        // Add departure time for traffic-aware routing
        if (options?.departAt) {
            params.append('departAt', options.departAt.toISOString());
        }

        // Add avoidances
        if (options?.avoid && options.avoid.length > 0) {
            params.append('avoid', options.avoid.join(','));
        }

        const response = await fetch(
            `${ROUTING_BASE_URL}/calculateRoute/${locations}/json?${params.toString()}`
        );

        if (!response.ok) {
            throw new Error(`TomTom Routing API error: ${response.status}`);
        }

        const data = await response.json();

        if (!data.routes || data.routes.length === 0) {
            return null;
        }

        const route = data.routes[0];
        const summary = route.summary;

        return {
            distanceMeters: summary.lengthInMeters,
            distanceKm: Math.round((summary.lengthInMeters / 1000) * 10) / 10,
            distanceMiles: Math.round((summary.lengthInMeters / 1609.344) * 10) / 10,
            durationSeconds: summary.travelTimeInSeconds,
            durationFormatted: formatDuration(summary.travelTimeInSeconds),
            trafficDelaySeconds: summary.trafficDelayInSeconds || 0,
            departureTime: summary.departureTime,
            arrivalTime: summary.arrivalTime,
        };
    } catch (error) {
        console.error('TomTom routing error:', error);
        return null;
    }
}

/**
 * Calculate route using location names (geocodes first, then routes)
 */
export async function calculateRouteByName(
    originQuery: string,
    destinationQuery: string,
    options?: {
        travelMode?: 'car' | 'truck' | 'taxi' | 'bus' | 'van' | 'motorcycle' | 'bicycle' | 'pedestrian';
        traffic?: boolean;
        departAt?: Date;
    }
): Promise<{ route: RouteInfo | null; origin: TomTomLocation | null; destination: TomTomLocation | null }> {
    // Geocode both locations
    const [originResults, destinationResults] = await Promise.all([
        searchPlaces(originQuery, { limit: 1 }),
        searchPlaces(destinationQuery, { limit: 1 }),
    ]);

    const origin = originResults[0] || null;
    const destination = destinationResults[0] || null;

    if (!origin || !destination) {
        return { route: null, origin, destination };
    }

    const route = await calculateRoute(origin.position, destination.position, options);

    return { route, origin, destination };
}

/**
 * Format the full address from a search result
 */
function formatFullAddress(result: TomTomSearchResult): string {
    const parts: string[] = [];

    if (result.poi?.name) {
        parts.push(result.poi.name);
    }

    if (result.address.freeformAddress) {
        if (!parts.includes(result.address.freeformAddress)) {
            parts.push(result.address.freeformAddress);
        }
    } else {
        const addressParts: string[] = [];
        if (result.address.streetNumber) addressParts.push(result.address.streetNumber);
        if (result.address.streetName) addressParts.push(result.address.streetName);
        if (result.address.municipality) addressParts.push(result.address.municipality);
        if (result.address.countrySubdivision) addressParts.push(result.address.countrySubdivision);
        if (result.address.country) addressParts.push(result.address.country);

        if (addressParts.length > 0) {
            parts.push(addressParts.join(', '));
        }
    }

    return parts.join(' - ') || 'Unknown Location';
}

/**
 * Format duration in seconds to human-readable string
 */
function formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours === 0) {
        return `${minutes} min${minutes !== 1 ? 's' : ''}`;
    }

    if (minutes === 0) {
        return `${hours} hour${hours !== 1 ? 's' : ''}`;
    }

    return `${hours} hour${hours !== 1 ? 's' : ''} ${minutes} min${minutes !== 1 ? 's' : ''}`;
}

/**
 * Get the TomTom Map SDK URL for embedding maps
 */
export function getTomTomMapSDKUrl(): string {
    return 'https://api.tomtom.com/maps-sdk-for-web/cdn/6.x/6.25.0/maps/maps-web.min.js';
}

/**
 * Get the TomTom Map CSS URL
 */
export function getTomTomMapCSSUrl(): string {
    return 'https://api.tomtom.com/maps-sdk-for-web/cdn/6.x/6.25.0/maps/maps.css';
}

export default {
    searchPlaces,
    getLocationSuggestions,
    calculateRoute,
    calculateRouteByName,
    getTomTomMapSDKUrl,
    getTomTomMapCSSUrl,
};
