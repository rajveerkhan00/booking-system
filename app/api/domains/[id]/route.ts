import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Domain from '@/models/Domain';

// GET - Fetch a single domain by ID
export async function GET(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const params = await props.params;
        await dbConnect();
        const domain = await Domain.findById(params.id);

        if (!domain) {
            return NextResponse.json(
                { success: false, message: 'Domain not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: domain
        });
    } catch (error: any) {
        console.error('Error fetching domain:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Failed to fetch domain' },
            { status: 500 }
        );
    }
}

// PUT - Update a domain
export async function PUT(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const params = await props.params;
        await dbConnect();
        const body = await request.json();

        const domain = await Domain.findByIdAndUpdate(params.id, body, {
            new: true,
            runValidators: true,
        });

        if (!domain) {
            return NextResponse.json(
                { success: false, message: 'Domain not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Domain updated successfully',
            data: domain
        });
    } catch (error: any) {
        console.error('Error updating domain:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Failed to update domain' },
            { status: 400 }
        );
    }
}

// DELETE - Delete a domain
export async function DELETE(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const params = await props.params;
        await dbConnect();
        const domain = await Domain.findByIdAndDelete(params.id);

        if (!domain) {
            return NextResponse.json(
                { success: false, message: 'Domain not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Domain deleted successfully'
        });
    } catch (error: any) {
        console.error('Error deleting domain:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Failed to delete domain' },
            { status: 500 }
        );
    }
}
