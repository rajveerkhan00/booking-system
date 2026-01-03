import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IThemePreference extends Document {
    themeId: string;
    updatedAt: Date;
}

const ThemePreferenceSchema = new Schema<IThemePreference>({
    themeId: { type: String, required: true, default: 'teal-ocean' },
}, {
    timestamps: true
});

const ThemePreference: Model<IThemePreference> = mongoose.models.ThemePreference || mongoose.model<IThemePreference>('ThemePreference', ThemePreferenceSchema);

export default ThemePreference;
