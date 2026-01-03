import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Domain from '@/models/Domain';

// GET - Fetch all domains or one by domainName
export async function GET(request: NextRequest) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const domainName = searchParams.get('domainName');

        if (domainName) {
            const domain = await Domain.findOne({
                domainName: { $regex: new RegExp(`^${domainName}$`, 'i') }
            });
            return NextResponse.json({
                success: true,
                data: domain
            });
        }

        const domains = await Domain.find({}).sort({ createdAt: -1 });

        return NextResponse.json({
            success: true,
            data: domains
        });
    } catch (error: any) {
        console.error('Error fetching domains:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Failed to fetch domains' },
            { status: 500 }
        );
    }
}

// POST - Create a new domain
export async function POST(request: NextRequest) {
    try {
        await dbConnect();
        const body = await request.json();

        // Basic validation
        if (!body.domainName) {
            return NextResponse.json(
                { success: false, message: 'Domain name is required' },
                { status: 400 }
            );
        }

        const domain = await Domain.create(body);

        return NextResponse.json({
            success: true,
            message: 'Domain created successfully',
            data: domain
        }, { status: 201 });
    } catch (error: any) {
        console.error('Error creating domain:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Failed to create domain' },
            { status: 400 }
        );
    }
}
