import mongoose, { Schema, Document } from 'mongoose';

export interface IOpportunity extends Document {
    name: string;
    account?: string;
    amount: number;
    stage: string;
    closeDate?: string;
    owner?: string;
    companyName?: string;
    companyBillingAddress?: string;
    priority?: number;
    accountId?: string;
    contactId?: string;
    position: number;
    createdAt: Date;
    updatedAt: Date;
}

const OpportunitySchema: Schema = new Schema({
    name: { type: String, required: true },
    account: { type: String },
    amount: { type: Number, default: 0 },
    stage: { type: String, default: 'New' },
    closeDate: { type: String },
    owner: { type: String },
    companyName: { type: String },
    companyBillingAddress: { type: String },
    priority: { type: Number, default: 1 },
    accountId: { type: String },
    contactId: { type: String },
    position: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model<IOpportunity>('Opportunity', OpportunitySchema);
