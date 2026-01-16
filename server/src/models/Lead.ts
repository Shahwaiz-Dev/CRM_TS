import mongoose, { Schema, Document } from 'mongoose';

export interface ILead extends Document {
    name: string;
    company: string;
    email: string;
    status: string;
    source: string;
    value: number;
    assignedTo?: string;
    createdAt: Date;
    updatedAt: Date;
}

const LeadSchema: Schema = new Schema({
    name: { type: String, required: true },
    company: { type: String },
    email: { type: String },
    status: { type: String, default: 'New' },
    source: { type: String },
    value: { type: Number, default: 0 },
    assignedTo: { type: String },
}, { timestamps: true });

export default mongoose.model<ILead>('Lead', LeadSchema);
