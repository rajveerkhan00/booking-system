import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDomainCarConfig {
    carId: string;
    price: number;
    isVisible: boolean;
}

export interface IDomain extends Document {
    domainName: string; // e.g., "example.com"
    themeId?: string; // Reference to Theme _id or name
    cars: IDomainCarConfig[];
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const DomainCarConfigSchema = new Schema<IDomainCarConfig>({
    carId: { type: String, required: true },
    price: { type: Number, required: true },
    isVisible: { type: Boolean, default: true }
});

const DomainSchema = new Schema<IDomain>({
    domainName: { type: String, required: true, unique: true },
    themeId: { type: String },
    cars: [DomainCarConfigSchema],
    isActive: { type: Boolean, default: true }
}, {
    timestamps: true
});

const Domain: Model<IDomain> = mongoose.models.Domain || mongoose.model<IDomain>('Domain', DomainSchema);

export default Domain;
