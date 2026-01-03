import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITheme extends Document {
    name: string;
    description: string;
    isActive: boolean;
    // Primary colors
    primaryColor: string;
    primaryColorRgb: string;
    primaryDark: string;
    primaryDarkRgb: string;
    // Secondary colors
    secondaryColor: string;
    secondaryColorRgb: string;
    secondaryDark: string;
    secondaryDarkRgb: string;
    // Background colors
    backgroundStart: string;
    backgroundMiddle: string;
    backgroundEnd: string;
    // Text colors
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    // Accent colors
    accentColor: string;
    accentColorRgb: string;
    successColor: string;
    successColorRgb: string;
    warningColor: string;
    warningColorRgb: string;
    // Card styles
    cardBackground: string;
    cardBorder: string;
    cardShadow: string;
    // Button gradient direction
    buttonGradientDirection: string;
    // Glass morphism
    glassOpacity: number;
    glassBlur: number;
    // Additional styling
    borderRadius: string;
    fontFamily: string;
    // Preview image (optional)
    previewImage?: string;
    createdAt: Date;
    updatedAt: Date;
}

const ThemeSchema = new Schema<ITheme>({
    name: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    isActive: { type: Boolean, default: false },
    // Primary colors
    primaryColor: { type: String, required: true, default: '#0d9488' },
    primaryColorRgb: { type: String, required: true, default: '13, 148, 136' },
    primaryDark: { type: String, required: true, default: '#0f766e' },
    primaryDarkRgb: { type: String, required: true, default: '15, 118, 110' },
    // Secondary colors
    secondaryColor: { type: String, required: true, default: '#3b82f6' },
    secondaryColorRgb: { type: String, required: true, default: '59, 130, 246' },
    secondaryDark: { type: String, required: true, default: '#2563eb' },
    secondaryDarkRgb: { type: String, required: true, default: '37, 99, 235' },
    // Background colors
    backgroundStart: { type: String, required: true, default: '#14b8a6' },
    backgroundMiddle: { type: String, required: true, default: '#0d9488' },
    backgroundEnd: { type: String, required: true, default: '#0f766e' },
    // Text colors
    textPrimary: { type: String, required: true, default: '#0f172a' },
    textSecondary: { type: String, required: true, default: '#475569' },
    textMuted: { type: String, required: true, default: '#94a3b8' },
    // Accent colors
    accentColor: { type: String, required: true, default: '#8b5cf6' },
    accentColorRgb: { type: String, required: true, default: '139, 92, 246' },
    successColor: { type: String, required: true, default: '#10b981' },
    successColorRgb: { type: String, required: true, default: '16, 185, 129' },
    warningColor: { type: String, required: true, default: '#f59e0b' },
    warningColorRgb: { type: String, required: true, default: '245, 158, 11' },
    // Card styles
    cardBackground: { type: String, required: true, default: 'rgba(255, 255, 255, 0.95)' },
    cardBorder: { type: String, required: true, default: 'rgba(255, 255, 255, 0.7)' },
    cardShadow: { type: String, required: true, default: '0 25px 50px -12px rgba(0, 0, 0, 0.15)' },
    // Button gradient direction
    buttonGradientDirection: { type: String, required: true, default: '135deg' },
    // Glass morphism
    glassOpacity: { type: Number, required: true, default: 0.95 },
    glassBlur: { type: Number, required: true, default: 24 },
    // Additional styling
    borderRadius: { type: String, required: true, default: '1rem' },
    fontFamily: { type: String, required: true, default: "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif" },
    // Preview image
    previewImage: { type: String },
}, {
    timestamps: true
});

// Ensure only one theme is active at a time
ThemeSchema.pre('save', async function (this: ITheme) {
    if (this.isActive) {
        const Theme = mongoose.models.Theme as Model<ITheme>;
        await Theme.updateMany(
            { _id: { $ne: this._id } },
            { isActive: false }
        );
    }
});

const Theme: Model<ITheme> = mongoose.models.Theme || mongoose.model<ITheme>('Theme', ThemeSchema);

export default Theme;
