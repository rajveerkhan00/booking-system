import mongoose from 'mongoose';

const BookingSchema = new mongoose.Schema({
    bookingType: {
        type: String,
        enum: ['transfer', 'rental'],
        default: 'transfer'
    },
    bookingReference: {
        type: String,
        unique: true
    },
    // Trip Info
    fromLocation: String,
    toLocation: String,
    date: String,
    pickupTime: String,
    passengers: Number,

    // Rental Specific
    dropoffDate: String,
    dropoffTime: String,
    licenseNumber: String,
    rentalExtras: {
        additionalDriver: Number,
        childSeat: Number,
        boosterSeat: Number
    },

    // Coordinates
    fromCoords: {
        lat: Number,
        lon: Number
    },
    toCoords: {
        lat: Number,
        lon: Number
    },

    // Estimates
    estimatedTime: String,
    estimatedDistance: String,

    // Currency & Price
    currency: String,
    totalPrice: Number,

    // Vehicle Info
    selectedVehicle: {
        id: String,
        name: String,
        type: { type: String },
        image: String,
        price: Number
    },

    // Details
    pickupAddress: String,
    destinationAddress: String,
    specialInstructions: String,

    // Luggage
    smallLuggage: Number,
    mediumLuggage: Number,

    // Passenger Info
    passengerTitle: String,
    passengerName: String,
    email: String,
    phone: String,
    countryCode: String,

    // Status
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled'],
        default: 'pending'
    },

    // Payment Info
    paymentStatus: {
        type: String,
        enum: ['unpaid', 'paid', 'refunded'],
        default: 'unpaid'
    },
    paypalOrderId: String,
    paypalCaptureId: String,

    createdAt: {
        type: Date,
        default: Date.now
    }
}, { collection: 'bookingforms' }); // Explicitly setting collection name as requested

// Check if model exists before creating to prevent overwrite errors in hot-reload
export default mongoose.models.Booking || mongoose.model('Booking', BookingSchema);
