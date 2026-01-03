import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import ThemePreference from '@/models/ThemePreference';
import { HARDCODED_THEMES } from '@/lib/themes';

// GET all themes (hardcoded list)
export async function GET() {
    try {
        await dbConnect();

        // Get the active theme ID to mark it
        let preference = await ThemePreference.findOne();
        const activeId = preference?.themeId || 'teal-ocean';

        // Return all hardcoded themes with active status
        const themes = HARDCODED_THEMES.map(theme => ({
            ...theme,
            _id: theme.id, // For compatibility
            isActive: theme.id === activeId
        }));

        return NextResponse.json({ success: true, data: themes });
    } catch (error) {
        console.error('Error fetching themes:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch themes' },
            { status: 500 }
        );
    }
}
