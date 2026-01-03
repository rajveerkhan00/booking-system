import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import ThemePreference from '@/models/ThemePreference';
import { getThemeById, getDefaultTheme, DEFAULT_THEME_ID } from '@/lib/themes';

// GET the currently active theme
export async function GET() {
    try {
        await dbConnect();

        // Find the preference doc
        let preference = await ThemePreference.findOne();

        // If no preference exists, create default
        if (!preference) {
            preference = await ThemePreference.create({ themeId: DEFAULT_THEME_ID });
        }

        const themeId = preference.themeId;
        const theme = getThemeById(themeId) || getDefaultTheme();

        // Add isActive flag for the frontend compatibility if needed
        const themeWithStatus = {
            ...theme,
            _id: theme.id, // Map id to _id for frontend compatibility
            isActive: true
        };

        return NextResponse.json({ success: true, data: themeWithStatus });
    } catch (error) {
        console.error('Error fetching active theme:', error);
        // Fallback to default
        const defaultTheme = getDefaultTheme();
        return NextResponse.json({
            success: true,
            data: { ...defaultTheme, _id: defaultTheme.id, isActive: true }
        });
    }
}

