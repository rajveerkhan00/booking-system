import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Car from '@/models/Car';

// GET - Get a single car by ID
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();

        const { id } = await params;
        const car = await Car.findById(id);

        if (!car) {
            return NextResponse.json(
                { success: false, message: 'Car not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: car
        });
    } catch (error: any) {
        console.error('Error fetching car:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Failed to fetch car' },
            { status: 500 }
        );
    }
}

// PUT - Update a car
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();

        const { id } = await params;

        let body: any = {};
        const contentType = request.headers.get('content-type') || '';

        if (contentType.includes('multipart/form-data')) {
            const formData = await request.formData();

            // Helper to safe parse numbers
            const safeFloat = (val: FormDataEntryValue | null) => val ? parseFloat(val.toString()) : undefined;
            const safeInt = (val: FormDataEntryValue | null) => val ? parseInt(val.toString()) : undefined;
            const safeBool = (val: FormDataEntryValue | null) => val === 'true';

            // Extract fields matching Car Interface
            // Note: For updates, undefined means "don't update", but formData.get returns null if missing.
            // However, typical form submission sends all fields. We'll handle present fields.

            const getIfPresent = (key: string) => formData.has(key) ? formData.get(key) : undefined;

            if (formData.has('carType')) body.carType = formData.get('carType');
            if (formData.has('name')) body.name = formData.get('name');
            if (formData.has('type')) body.type = formData.get('type');
            if (formData.has('price')) body.price = safeFloat(formData.get('price'));
            if (formData.has('currency')) body.currency = formData.get('currency');
            if (formData.has('description')) body.description = formData.get('description');

            if (formData.has('passengers')) body.passengers = safeInt(formData.get('passengers'));
            if (formData.has('mediumLuggage')) body.mediumLuggage = safeInt(formData.get('mediumLuggage'));
            if (formData.has('smallLuggage')) body.smallLuggage = safeInt(formData.get('smallLuggage'));
            if (formData.has('rating')) body.rating = safeFloat(formData.get('rating'));
            if (formData.has('cancellationPolicy')) body.cancellationPolicy = formData.get('cancellationPolicy');

            if (formData.has('category')) body.category = formData.get('category');
            if (formData.has('seats')) body.seats = safeInt(formData.get('seats'));
            if (formData.has('bags')) body.bags = safeInt(formData.get('bags'));
            if (formData.has('transmission')) body.transmission = formData.get('transmission');
            if (formData.has('pricePerDay')) body.pricePerDay = safeFloat(formData.get('pricePerDay'));
            if (formData.has('fuelType')) body.fuelType = formData.get('fuelType');
            if (formData.has('pickupLocation')) body.pickupLocation = formData.get('pickupLocation');

            if (formData.has('features')) {
                const features = formData.get('features');
                if (features) {
                    try {
                        body.features = JSON.parse(features.toString());
                    } catch (e) {
                        body.features = [];
                    }
                }
            }

            if (formData.has('isActive')) body.isActive = safeBool(formData.get('isActive'));

            // Handle Image
            const imageFile = formData.get('image');

            if (imageFile && imageFile instanceof File && imageFile.size > 0) {
                const { uploadToCloudinary } = await import('@/lib/cloudinary');
                const arrayBuffer = await imageFile.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);
                const result = await uploadToCloudinary(buffer);
                body.image = result.secure_url;
            } else if (typeof imageFile === 'string' && imageFile) {
                // Keep existing URL if sent as string
                body.image = imageFile;
            }
        } else {
            body = await request.json();
        }

        const car = await Car.findByIdAndUpdate(
            id,
            { ...body, updatedAt: new Date() },
            { new: true, runValidators: true }
        );

        if (!car) {
            return NextResponse.json(
                { success: false, message: 'Car not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Car updated successfully',
            data: car
        });
    } catch (error: any) {
        console.error('Error updating car:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Failed to update car' },
            { status: 500 }
        );
    }
}

// DELETE - Delete a car
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();

        const { id } = await params;
        const car = await Car.findByIdAndDelete(id);

        if (!car) {
            return NextResponse.json(
                { success: false, message: 'Car not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Car deleted successfully'
        });
    } catch (error: any) {
        console.error('Error deleting car:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Failed to delete car' },
            { status: 500 }
        );
    }
}
