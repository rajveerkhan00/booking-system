import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import ThemePreference from '@/models/ThemePreference';
import { getThemeById, getDefaultTheme } from '@/lib/themes';

// GET theme by ID
export async function GET(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const params = await props.params;
        const themeId = params.id;
        const theme = getThemeById(themeId) || getDefaultTheme();

        return NextResponse.json({
            success: true,
            data: { ...theme, _id: theme.id, isActive: false }
        });
    } catch (error) {
        console.error('Error fetching theme:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch theme' },
            { status: 500 }
        );
    }
}

// Update active theme (global)
export async function PUT(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const params = await props.params;
        const themeId = params.id;
        await dbConnect();

        // Update or create the preference
        await ThemePreference.findOneAndUpdate(
            {},
            { themeId },
            { upsert: true, new: true }
        );

        return NextResponse.json({
            success: true,
            message: 'Theme activated successfully'
        });
    } catch (error) {
        console.error('Error activating theme:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to activate theme' },
            { status: 500 }
        );
    }
}
