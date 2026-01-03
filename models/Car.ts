import mongoose from 'mongoose';

const CarSchema = new mongoose.Schema({
    // Car type: 'transfer' for airport transfers, 'rental' for car rentals
    carType: {
        type: String,
        enum: ['transfer', 'rental'],
        required: true
    },

    // Common fields
    name: {
        type: String,
        required: true
    },
    type: {
        type: String, // e.g., "Standard Service", "Premium Service", "Economy", etc.
        required: true
    },
    image: {
        type: String,
        default: '/placeholder-car.png'
    },
    price: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'USD'
    },
    description: {
        type: String,
        default: ''
    },

    // Transfer-specific fields
    passengers: {
        type: Number,
        default: 0
    },
    mediumLuggage: {
        type: Number,
        default: 0
    },
    smallLuggage: {
        type: Number,
        default: 0
    },
    rating: {
        type: Number,
        min: 0,
        max: 5,
        default: 5
    },
    cancellationPolicy: {
        type: String,
        default: 'Free Cancellation 24h'
    },

    // Rental-specific fields
    category: {
        type: String, // e.g., "Hyundai Avante or similar"
        default: ''
    },
    seats: {
        type: Number,
        default: 0
    },
    bags: {
        type: Number,
        default: 0
    },
    transmission: {
        type: String,
        enum: ['Automatic', 'Manual'],
        default: 'Automatic'
    },
    pricePerDay: {
        type: Number,
        default: 0
    },
    fuelType: {
        type: String,
        enum: ['Petrol', 'Diesel', 'Electric', 'Hybrid'],
        default: 'Petrol'
    },
    pickupLocation: {
        type: String,
        default: ''
    },
    features: [{
        type: String
    }],

    // Status
    isActive: {
        type: Boolean,
        default: true
    },

    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, { collection: 'cars' });

// Update the updatedAt field on save
CarSchema.pre('save', function () {
    this.set('updatedAt', new Date());
});

// Check if model exists before creating to prevent overwrite errors in hot-reload
export default mongoose.models.Car || mongoose.model('Car', CarSchema);
