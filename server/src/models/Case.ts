import mongoose, { Schema, Document } from 'mongoose';

export interface ICase extends Document {
    subject: string;
    description?: string;
    status: string;
    priority: string;
    contactId?: string;
    accountId?: string;
    accountName?: string;
    createdAt: Date;
    updatedAt: Date;
}

const CaseSchema: Schema = new Schema({
    subject: { type: String, required: true },
    description: { type: String },
    status: { type: String, default: 'New' },
    priority: { type: String, default: 'Medium' },
    contactId: { type: String },
    accountId: { type: String },
    accountName: { type: String },
}, { timestamps: true });

export default mongoose.model<ICase>('Case', CaseSchema);
