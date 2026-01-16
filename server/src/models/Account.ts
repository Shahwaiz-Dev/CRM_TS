import mongoose, { Schema, Document } from 'mongoose';

export interface IAccount extends Document {
    accountName: string;
    type: string;
    industry?: string;
    website?: string;
    phone?: string;
    billingAddress?: string;
    shippingAddress?: string;
    fax?: string;
    tickerSymbol?: string;
    ownership?: string;
    numberOfLocations?: string;
    employees?: string;
    parentAccount?: string;
    accountNumber?: string;
    createdAt: Date;
    updatedAt: Date;
}

const AccountSchema: Schema = new Schema({
    accountName: { type: String, required: true },
    type: { type: String, default: 'Prospect' },
    industry: { type: String },
    website: { type: String },
    phone: { type: String },
    billingAddress: { type: String },
    shippingAddress: { type: String },
    fax: { type: String },
    tickerSymbol: { type: String },
    ownership: { type: String },
    numberOfLocations: { type: String },
    employees: { type: String },
    parentAccount: { type: String },
    accountNumber: { type: String },
}, { timestamps: true });

export default mongoose.model<IAccount>('Account', AccountSchema);
