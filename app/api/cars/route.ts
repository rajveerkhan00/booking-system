import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Car from '@/models/Car';

// GET - Fetch all cars or filter by carType
export async function GET(request: NextRequest) {
    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const carType = searchParams.get('carType');
        const isActive = searchParams.get('isActive');

        // Build query
        const query: any = {};
        if (carType) {
            query.carType = carType;
        }
        if (isActive !== null && isActive !== undefined) {
            query.isActive = isActive === 'true';
        }

        const cars = await Car.find(query).sort({ createdAt: -1 });

        return NextResponse.json({
            success: true,
            data: cars
        });
    } catch (error: any) {
        console.error('Error fetching cars:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Failed to fetch cars' },
            { status: 500 }
        );
    }
}

// POST - Create a new car
export async function POST(request: NextRequest) {
    try {
        await dbConnect();

        let body: any = {};

        const contentType = request.headers.get('content-type') || '';

        if (contentType.includes('multipart/form-data')) {
            const formData = await request.formData();

            // Helper to safe parse numbers
            const safeFloat = (val: FormDataEntryValue | null) => val ? parseFloat(val.toString()) : undefined;
            const safeInt = (val: FormDataEntryValue | null) => val ? parseInt(val.toString()) : undefined;
            const safeBool = (val: FormDataEntryValue | null) => val === 'true';

            // Extract fields matching Car Interface
            body.carType = formData.get('carType');
            body.name = formData.get('name');
            body.type = formData.get('type');
            body.price = safeFloat(formData.get('price'));
            body.currency = formData.get('currency');
            body.description = formData.get('description');

            // Transfer fields
            body.passengers = safeInt(formData.get('passengers'));
            body.mediumLuggage = safeInt(formData.get('mediumLuggage'));
            body.smallLuggage = safeInt(formData.get('smallLuggage'));
            body.rating = safeFloat(formData.get('rating'));
            body.cancellationPolicy = formData.get('cancellationPolicy');

            // Rental fields
            body.category = formData.get('category');
            body.seats = safeInt(formData.get('seats'));
            body.bags = safeInt(formData.get('bags'));
            body.transmission = formData.get('transmission');
            body.pricePerDay = safeFloat(formData.get('pricePerDay'));
            body.fuelType = formData.get('fuelType');
            body.pickupLocation = formData.get('pickupLocation');

            // Parse features (expected as JSON string or multiple entries)
            const features = formData.get('features');
            if (features) {
                try {
                    body.features = JSON.parse(features.toString());
                } catch (e) {
                    body.features = [];
                }
            } else {
                body.features = [];
            }

            body.isActive = safeBool(formData.get('isActive'));

            // Handle Image
            const imageFile = formData.get('image');

            // Need to import uploadToCloudinary dynamically or at top. 
            // I'll assume I add the import at the top of file later.
            // But wait, I can't add imports with replace_file_content in the middle easily without context.
            // I'll assume global import or require. 
            // Actually, I should use multi_replace to add the import AND replace the function.

            if (imageFile && imageFile instanceof File && imageFile.size > 0) {
                const { uploadToCloudinary } = await import('@/lib/cloudinary');
                const arrayBuffer = await imageFile.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);
                const result = await uploadToCloudinary(buffer);

                body.image = result.secure_url;
            } else if (typeof imageFile === 'string' && imageFile) {
                body.image = imageFile;
            }

        } else {
            // Fallback for JSON requests
            body = await request.json();
        }

        // Validate required fields
        if (!body.name || !body.type || !body.carType || body.price === undefined) {
            return NextResponse.json(
                { success: false, message: 'Name, type, carType, and price are required' },
                { status: 400 }
            );
        }

        const car = await Car.create(body);

        return NextResponse.json({
            success: true,
            message: 'Car created successfully',
            data: car
        }, { status: 201 });
    } catch (error: any) {
        console.error('Error creating car:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Failed to create car' },
            { status: 500 }
        );
    }
}
