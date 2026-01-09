// IP Geolocation and Currency Detection Service

// Country code to currency code mapping
export const COUNTRY_TO_CURRENCY: Record<string, string> = {
    // Major countries
    'US': 'USD', 'GB': 'GBP', 'EU': 'EUR', 'PK': 'PKR', 'IN': 'INR',
    'AE': 'AED', 'SA': 'SAR', 'QA': 'QAR', 'OM': 'OMR', 'KW': 'KWD',
    'BH': 'BHD', 'JP': 'JPY', 'CN': 'CNY', 'CA': 'CAD', 'AU': 'AUD',
    'SG': 'SGD', 'CH': 'CHF', 'TR': 'TRY', 'RU': 'RUB', 'BR': 'BRL',
    'ZA': 'ZAR', 'NZ': 'NZD', 'MX': 'MXN', 'HK': 'HKD', 'NO': 'NOK',
    'SE': 'SEK', 'DK': 'DKK', 'PL': 'PLN', 'IL': 'ILS', 'TH': 'THB',
    'ID': 'IDR', 'MY': 'MYR', 'PH': 'PHP', 'VN': 'VND', 'EG': 'EGP',
    'NG': 'NGN', 'KE': 'KES', 'GH': 'GHS', 'MA': 'MAD', 'DZ': 'DZD',
    'TN': 'TND', 'AF': 'AFN', 'AL': 'ALL', 'AM': 'AMD', 'AO': 'AOA',
    'AR': 'ARS', 'AZ': 'AZN', 'BA': 'BAM', 'BB': 'BBD', 'BD': 'BDT',
    'BG': 'BGN', 'BI': 'BIF', 'BM': 'BMD', 'BN': 'BND', 'BO': 'BOB',
    'BS': 'BSD', 'BT': 'BTN', 'BW': 'BWP', 'BY': 'BYN', 'BZ': 'BZD',
    'CD': 'CDF', 'CL': 'CLP', 'CO': 'COP', 'CR': 'CRC', 'CU': 'CUP',
    'CV': 'CVE', 'CZ': 'CZK', 'DJ': 'DJF', 'DO': 'DOP', 'ET': 'ETB',
    'FJ': 'FJD', 'FK': 'FKP', 'GE': 'GEL', 'GI': 'GIP', 'GM': 'GMD',
    'GN': 'GNF', 'GT': 'GTQ', 'GY': 'GYD', 'HN': 'HNL', 'HR': 'HRK',
    'HT': 'HTG', 'HU': 'HUF', 'IQ': 'IQD', 'IR': 'IRR', 'IS': 'ISK',
    'JM': 'JMD', 'JO': 'JOD', 'KG': 'KGS', 'KH': 'KHR', 'KM': 'KMF',
    'KR': 'KRW', 'KY': 'KYD', 'KZ': 'KZT', 'LA': 'LAK', 'LB': 'LBP',
    'LK': 'LKR', 'LR': 'LRD', 'LS': 'LSL', 'LY': 'LYD', 'MG': 'MGA',
    'MK': 'MKD', 'MM': 'MMK', 'MN': 'MNT', 'MO': 'MOP', 'MR': 'MRU',
    'MU': 'MUR', 'MV': 'MVR', 'MW': 'MWK', 'MZ': 'MZN', 'NA': 'NAD',
    'NI': 'NIO', 'NP': 'NPR', 'PA': 'PAB', 'PE': 'PEN', 'PG': 'PGK',
    'PY': 'PYG', 'RO': 'RON', 'RS': 'RSD', 'RW': 'RWF', 'SB': 'SBD',
    'SC': 'SCR', 'SD': 'SDG', 'SL': 'SLL', 'SO': 'SOS', 'SR': 'SRD',
    'SS': 'SSP', 'ST': 'STN', 'SY': 'SYP', 'SZ': 'SZL', 'TJ': 'TJS',
    'TM': 'TMT', 'TO': 'TOP', 'TT': 'TTD', 'TW': 'TWD', 'TZ': 'TZS',
    'UA': 'UAH', 'UG': 'UGX', 'UY': 'UYU', 'UZ': 'UZS', 'VE': 'VES',
    'VU': 'VUV', 'WS': 'WST', 'YE': 'YER', 'ZM': 'ZMW', 'ZW': 'ZWL',
    // Eurozone countries
    'AT': 'EUR', 'BE': 'EUR', 'CY': 'EUR', 'EE': 'EUR', 'FI': 'EUR',
    'FR': 'EUR', 'DE': 'EUR', 'GR': 'EUR', 'IE': 'EUR', 'IT': 'EUR',
    'LV': 'EUR', 'LT': 'EUR', 'LU': 'EUR', 'MT': 'EUR', 'NL': 'EUR',
    'PT': 'EUR', 'SK': 'EUR', 'SI': 'EUR', 'ES': 'EUR',
};

// License number format by country
// Format: { minLength, maxLength, description }
export interface LicenseFormat {
    minLength: number;
    maxLength: number;
    description: string;
    countryName: string;
}

export const COUNTRY_LICENSE_FORMATS: Record<string, LicenseFormat> = {
    // North America
    'US': { minLength: 8, maxLength: 16, description: '8-16 characters', countryName: 'United States' },
    'CA': { minLength: 8, maxLength: 15, description: '8-15 characters', countryName: 'Canada' },
    'MX': { minLength: 9, maxLength: 13, description: '9-13 characters', countryName: 'Mexico' },

    // Europe
    'GB': { minLength: 16, maxLength: 16, description: '16 characters', countryName: 'United Kingdom' },
    'DE': { minLength: 11, maxLength: 11, description: '11 characters', countryName: 'Germany' },
    'FR': { minLength: 12, maxLength: 15, description: '12-15 characters', countryName: 'France' },
    'IT': { minLength: 10, maxLength: 10, description: '10 characters', countryName: 'Italy' },
    'ES': { minLength: 9, maxLength: 9, description: '9 characters', countryName: 'Spain' },
    'NL': { minLength: 10, maxLength: 10, description: '10 characters', countryName: 'Netherlands' },
    'BE': { minLength: 10, maxLength: 10, description: '10 characters', countryName: 'Belgium' },
    'AT': { minLength: 8, maxLength: 10, description: '8-10 characters', countryName: 'Austria' },
    'CH': { minLength: 6, maxLength: 12, description: '6-12 characters', countryName: 'Switzerland' },
    'PL': { minLength: 9, maxLength: 14, description: '9-14 characters', countryName: 'Poland' },
    'SE': { minLength: 10, maxLength: 10, description: '10 characters', countryName: 'Sweden' },
    'NO': { minLength: 11, maxLength: 11, description: '11 characters', countryName: 'Norway' },
    'DK': { minLength: 8, maxLength: 10, description: '8-10 characters', countryName: 'Denmark' },
    'FI': { minLength: 8, maxLength: 12, description: '8-12 characters', countryName: 'Finland' },
    'IE': { minLength: 8, maxLength: 14, description: '8-14 characters', countryName: 'Ireland' },
    'PT': { minLength: 8, maxLength: 12, description: '8-12 characters', countryName: 'Portugal' },
    'GR': { minLength: 7, maxLength: 10, description: '7-10 characters', countryName: 'Greece' },
    'CZ': { minLength: 8, maxLength: 10, description: '8-10 characters', countryName: 'Czech Republic' },
    'HU': { minLength: 8, maxLength: 10, description: '8-10 characters', countryName: 'Hungary' },
    'RO': { minLength: 8, maxLength: 12, description: '8-12 characters', countryName: 'Romania' },
    'BG': { minLength: 9, maxLength: 10, description: '9-10 characters', countryName: 'Bulgaria' },
    'RU': { minLength: 10, maxLength: 10, description: '10 characters', countryName: 'Russia' },
    'UA': { minLength: 9, maxLength: 9, description: '9 characters', countryName: 'Ukraine' },
    'TR': { minLength: 11, maxLength: 11, description: '11 characters', countryName: 'Turkey' },

    // Asia
    'PK': { minLength: 13, maxLength: 15, description: '13-15 characters', countryName: 'Pakistan' },
    'IN': { minLength: 15, maxLength: 16, description: '15-16 characters', countryName: 'India' },
    'CN': { minLength: 18, maxLength: 18, description: '18 characters', countryName: 'China' },
    'JP': { minLength: 12, maxLength: 12, description: '12 characters', countryName: 'Japan' },
    'KR': { minLength: 10, maxLength: 12, description: '10-12 characters', countryName: 'South Korea' },
    'TH': { minLength: 8, maxLength: 8, description: '8 characters', countryName: 'Thailand' },
    'MY': { minLength: 8, maxLength: 14, description: '8-14 characters', countryName: 'Malaysia' },
    'SG': { minLength: 9, maxLength: 9, description: '9 characters', countryName: 'Singapore' },
    'PH': { minLength: 11, maxLength: 13, description: '11-13 characters', countryName: 'Philippines' },
    'ID': { minLength: 12, maxLength: 16, description: '12-16 characters', countryName: 'Indonesia' },
    'VN': { minLength: 12, maxLength: 12, description: '12 characters', countryName: 'Vietnam' },
    'BD': { minLength: 15, maxLength: 15, description: '15 characters', countryName: 'Bangladesh' },
    'LK': { minLength: 8, maxLength: 10, description: '8-10 characters', countryName: 'Sri Lanka' },
    'NP': { minLength: 9, maxLength: 12, description: '9-12 characters', countryName: 'Nepal' },

    // Middle East
    'AE': { minLength: 7, maxLength: 10, description: '7-10 characters', countryName: 'UAE' },
    'SA': { minLength: 10, maxLength: 10, description: '10 characters', countryName: 'Saudi Arabia' },
    'QA': { minLength: 11, maxLength: 11, description: '11 characters', countryName: 'Qatar' },
    'KW': { minLength: 12, maxLength: 12, description: '12 characters', countryName: 'Kuwait' },
    'OM': { minLength: 8, maxLength: 10, description: '8-10 characters', countryName: 'Oman' },
    'BH': { minLength: 9, maxLength: 9, description: '9 characters', countryName: 'Bahrain' },
    'JO': { minLength: 8, maxLength: 10, description: '8-10 characters', countryName: 'Jordan' },
    'LB': { minLength: 6, maxLength: 8, description: '6-8 characters', countryName: 'Lebanon' },
    'IL': { minLength: 7, maxLength: 9, description: '7-9 characters', countryName: 'Israel' },
    'IQ': { minLength: 8, maxLength: 12, description: '8-12 characters', countryName: 'Iraq' },
    'IR': { minLength: 10, maxLength: 10, description: '10 characters', countryName: 'Iran' },

    // Africa
    'EG': { minLength: 14, maxLength: 14, description: '14 characters', countryName: 'Egypt' },
    'ZA': { minLength: 13, maxLength: 13, description: '13 characters', countryName: 'South Africa' },
    'NG': { minLength: 11, maxLength: 12, description: '11-12 characters', countryName: 'Nigeria' },
    'KE': { minLength: 8, maxLength: 10, description: '8-10 characters', countryName: 'Kenya' },
    'GH': { minLength: 9, maxLength: 12, description: '9-12 characters', countryName: 'Ghana' },
    'MA': { minLength: 8, maxLength: 10, description: '8-10 characters', countryName: 'Morocco' },
    'DZ': { minLength: 9, maxLength: 11, description: '9-11 characters', countryName: 'Algeria' },
    'TN': { minLength: 8, maxLength: 8, description: '8 characters', countryName: 'Tunisia' },

    // Oceania
    'AU': { minLength: 8, maxLength: 10, description: '8-10 characters', countryName: 'Australia' },
    'NZ': { minLength: 8, maxLength: 8, description: '8 characters', countryName: 'New Zealand' },

    // South America
    'BR': { minLength: 11, maxLength: 11, description: '11 characters', countryName: 'Brazil' },
    'AR': { minLength: 7, maxLength: 8, description: '7-8 characters', countryName: 'Argentina' },
    'CL': { minLength: 8, maxLength: 9, description: '8-9 characters', countryName: 'Chile' },
    'CO': { minLength: 10, maxLength: 11, description: '10-11 characters', countryName: 'Colombia' },
    'PE': { minLength: 8, maxLength: 9, description: '8-9 characters', countryName: 'Peru' },
    'VE': { minLength: 7, maxLength: 10, description: '7-10 characters', countryName: 'Venezuela' },
};

// Default license format for countries not in the list
export const DEFAULT_LICENSE_FORMAT: LicenseFormat = {
    minLength: 6,
    maxLength: 20,
    description: '6-20 characters',
    countryName: 'International'
};

/**
 * Validates a license number based on the country's format
 * Returns { isValid: boolean, errorMessage: string | null }
 */
export function validateLicense(licenseNumber: string, countryCode: string): { isValid: boolean; errorMessage: string | null } {
    const format = COUNTRY_LICENSE_FORMATS[countryCode?.toUpperCase()] || DEFAULT_LICENSE_FORMAT;
    const cleanedLicense = licenseNumber.replace(/[\s-]/g, ''); // Remove spaces and dashes

    if (!cleanedLicense) {
        return { isValid: false, errorMessage: 'License number is required' };
    }

    if (cleanedLicense.length < format.minLength) {
        return {
            isValid: false,
            errorMessage: `${format.countryName} license requires at least ${format.minLength} characters. You entered ${cleanedLicense.length}.`
        };
    }

    if (cleanedLicense.length > format.maxLength) {
        return {
            isValid: false,
            errorMessage: `${format.countryName} license should be maximum ${format.maxLength} characters. You entered ${cleanedLicense.length}.`
        };
    }

    return { isValid: true, errorMessage: null };
}

/**
 * Get license format info for a country
 */
export function getLicenseFormat(countryCode: string): LicenseFormat {
    return COUNTRY_LICENSE_FORMATS[countryCode?.toUpperCase()] || DEFAULT_LICENSE_FORMAT;
}

export interface GeoLocationData {
    ip: string;
    countryCode: string;
    countryName: string;
    city: string;
    region: string;
    timezone: string;
    currency: string;
    latitude?: number;
    longitude?: number;
}

// Primary API: ip-api.com (free, no key required, 45 requests/minute)
async function fetchFromIpApi(): Promise<GeoLocationData | null> {
    try {
        const response = await fetch('http://ip-api.com/json/?fields=status,message,country,countryCode,region,city,timezone,lat,lon,query');
        const data = await response.json();

        if (data.status === 'success') {
            const countryCode = data.countryCode;
            const currency = COUNTRY_TO_CURRENCY[countryCode] || 'USD';

            return {
                ip: data.query,
                countryCode: countryCode,
                countryName: data.country,
                city: data.city,
                region: data.region,
                timezone: data.timezone,
                currency: currency,
                latitude: data.lat,
                longitude: data.lon,
            };
        }
        return null;
    } catch (error) {
        console.error('ip-api.com failed:', error);
        return null;
    }
}

// Backup API: ipapi.co (free tier, 1000/day)
async function fetchFromIpApiCo(): Promise<GeoLocationData | null> {
    try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();

        if (!data.error) {
            const countryCode = data.country_code;
            const currency = data.currency || COUNTRY_TO_CURRENCY[countryCode] || 'USD';

            return {
                ip: data.ip,
                countryCode: countryCode,
                countryName: data.country_name,
                city: data.city,
                region: data.region,
                timezone: data.timezone,
                currency: currency,
                latitude: data.latitude,
                longitude: data.longitude,
            };
        }
        return null;
    } catch (error) {
        console.error('ipapi.co failed:', error);
        return null;
    }
}

// Tertiary backup: ipinfo.io (50k/month free)
async function fetchFromIpInfo(): Promise<GeoLocationData | null> {
    try {
        const response = await fetch('https://ipinfo.io/json');
        const data = await response.json();

        if (data.country) {
            const countryCode = data.country;
            const currency = COUNTRY_TO_CURRENCY[countryCode] || 'USD';

            // Parse location if available
            let lat, lon;
            if (data.loc) {
                const [latitude, longitude] = data.loc.split(',');
                lat = parseFloat(latitude);
                lon = parseFloat(longitude);
            }

            return {
                ip: data.ip,
                countryCode: countryCode,
                countryName: data.country, // ipinfo.io only returns code
                city: data.city || '',
                region: data.region || '',
                timezone: data.timezone || '',
                currency: currency,
                latitude: lat,
                longitude: lon,
            };
        }
        return null;
    } catch (error) {
        console.error('ipinfo.io failed:', error);
        return null;
    }
}

/**
 * Fetches user's geolocation and currency based on their IP address.
 * Uses multiple fallback APIs for reliability.
 * Fetches fresh data on every page load.
 */
export async function getGeoLocation(): Promise<GeoLocationData> {
    // Try primary API
    console.log('🌍 Fetching geolocation from ip-api.com...');
    let result = await fetchFromIpApi();

    // Try backup if primary fails
    if (!result) {
        console.log('🌍 Trying backup: ipapi.co...');
        result = await fetchFromIpApiCo();
    }

    // Try tertiary backup
    if (!result) {
        console.log('🌍 Trying backup: ipinfo.io...');
        result = await fetchFromIpInfo();
    }

    // Default fallback
    if (!result) {
        console.log('🌍 All geolocation APIs failed, using default (USD)');
        result = {
            ip: 'unknown',
            countryCode: 'US',
            countryName: 'United States',
            city: 'Unknown',
            region: 'Unknown',
            timezone: 'America/New_York',
            currency: 'USD',
        };
    }

    console.log(`🌍 Detected location: ${result.city}, ${result.countryName} (${result.countryCode}) → ${result.currency}`);
    return result;
}

/**
 * Get currency code from country code
 */
export function getCurrencyFromCountry(countryCode: string): string {
    return COUNTRY_TO_CURRENCY[countryCode.toUpperCase()] || 'USD';
}
