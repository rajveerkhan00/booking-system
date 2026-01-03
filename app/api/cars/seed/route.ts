import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Car from '@/models/Car';

// Initial transfer cars data
const TRANSFER_CARS = [
    {
        carType: 'transfer',
        name: 'Sedan Car 3pax',
        type: 'Standard Service',
        image: '/sedan-transfer.png',
        passengers: 3,
        mediumLuggage: 2,
        smallLuggage: 3,
        price: 2269.46,
        currency: 'USD',
        rating: 5,
        cancellationPolicy: 'Free Cancellation 24h',
        isActive: true
    },
    {
        carType: 'transfer',
        name: 'MPV 4pax',
        type: 'Standard Service',
        image: '/mpv-transfer.png',
        passengers: 4,
        mediumLuggage: 4,
        smallLuggage: 4,
        price: 2937.80,
        currency: 'USD',
        rating: 5,
        cancellationPolicy: 'Free Cancellation 24h',
        isActive: true
    },
    {
        carType: 'transfer',
        name: 'Minivan 5pax',
        type: 'Standard Service',
        image: '/minivan-transfer.png',
        passengers: 5,
        mediumLuggage: 5,
        smallLuggage: 5,
        price: 3250.00,
        currency: 'USD',
        rating: 4.5,
        cancellationPolicy: 'Free Cancellation 24h',
        isActive: true
    },
    {
        carType: 'transfer',
        name: 'SUV 6pax',
        type: 'Premium Service',
        image: '/suv-transfer.png',
        passengers: 6,
        mediumLuggage: 6,
        smallLuggage: 6,
        price: 4100.00,
        currency: 'USD',
        rating: 5,
        cancellationPolicy: 'Free Cancellation 24h',
        isActive: true
    }
];

// Initial rental cars data
const RENTAL_CARS = [
    {
        carType: 'rental',
        name: 'Compact',
        type: 'Economy',
        category: 'Hyundai Avante or similar',
        image: '/compact-car-city.png',
        seats: 5,
        bags: 3,
        transmission: 'Automatic',
        price: 23002.02,
        pricePerDay: 5750.505,
        description: 'Free Cancellation',
        fuelType: 'Petrol',
        pickupLocation: 'Free Shuttle Bus',
        features: ['Free Cancellation', 'Damage & theft coverage', 'Full to Full'],
        currency: 'USD',
        isActive: true
    },
    {
        carType: 'rental',
        name: 'SUV',
        type: 'Premium',
        category: 'Toyota Land Cruiser or similar',
        image: '/suv-car.png',
        seats: 5,
        bags: 5,
        transmission: 'Automatic',
        price: 316352.38,
        pricePerDay: 79088.095,
        description: 'Free Cancellation',
        fuelType: 'Petrol',
        pickupLocation: 'Free Shuttle Bus',
        features: ['Free Cancellation', 'Damage & theft coverage', 'Full to Full'],
        currency: 'USD',
        isActive: true
    },
    {
        carType: 'rental',
        name: 'Fullsize',
        type: 'Standard',
        category: 'Hyundai i45 or similar',
        image: '/fullsize-sedan.jpg',
        seats: 5,
        bags: 5,
        transmission: 'Automatic',
        price: 519151.54,
        pricePerDay: 129787.885,
        description: 'Free Cancellation',
        fuelType: 'Petrol',
        pickupLocation: 'Free Shuttle Bus',
        features: ['Free Cancellation', 'Damage & theft coverage', 'Full to Full'],
        currency: 'USD',
        isActive: true
    },
    {
        carType: 'rental',
        name: 'Truck',
        type: 'Utility',
        category: 'Ford Ranger or similar',
        image: '/truck-pickup.jpg',
        seats: 5,
        bags: 3,
        transmission: 'Automatic',
        price: 206265.42,
        pricePerDay: 51566.355,
        description: 'Free Cancellation',
        fuelType: 'Diesel',
        pickupLocation: 'Free Shuttle Bus',
        features: ['Free Cancellation', 'Damage & theft coverage', 'Full to Full'],
        currency: 'USD',
        isActive: true
    }
];

// POST - Seed the database with initial car data
export async function POST() {
    try {
        await dbConnect();

        // Check if cars already exist
        const existingCount = await Car.countDocuments();

        if (existingCount > 0) {
            return NextResponse.json({
                success: false,
                message: `Database already has ${existingCount} cars. Delete them first if you want to reseed.`
            }, { status: 400 });
        }

        // Insert all cars
        const allCars = [...TRANSFER_CARS, ...RENTAL_CARS];
        await Car.insertMany(allCars);

        return NextResponse.json({
            success: true,
            message: `Successfully seeded ${allCars.length} cars (${TRANSFER_CARS.length} transfers, ${RENTAL_CARS.length} rentals)`
        }, { status: 201 });
    } catch (error: any) {
        console.error('Error seeding cars:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Failed to seed cars' },
            { status: 500 }
        );
    }
}

// DELETE - Clear all cars (for re-seeding)
export async function DELETE() {
    try {
        await dbConnect();

        const result = await Car.deleteMany({});

        return NextResponse.json({
            success: true,
            message: `Deleted ${result.deletedCount} cars`
        });
    } catch (error: any) {
        console.error('Error clearing cars:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Failed to clear cars' },
            { status: 500 }
        );
    }
}
