import mongoose, { Schema, Document } from 'mongoose';

export interface IContact extends Document {
    firstName: string;
    lastName: string;
    email: string;
    email2?: string;
    phone?: string;
    phone2?: string;
    title?: string;
    accountId?: string;
    accountName?: string;
    projectId?: string;
    projectName?: string;
    address?: string;
    language?: string;
    status: string;
    source?: string;
    notes?: string;
    assignedTo?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const ContactSchema: Schema = new Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    email2: { type: String },
    phone: { type: String },
    phone2: { type: String },
    title: { type: String },
    accountId: { type: String },
    accountName: { type: String },
    projectId: { type: String },
    projectName: { type: String },
    address: { type: String },
    language: { type: String },
    status: { type: String, default: 'Contact' },
    source: { type: String },
    notes: { type: String },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export default mongoose.model<IContact>('Contact', ContactSchema);
