import mongoose, { Schema, Document } from 'mongoose';

export interface ITemplate extends Document {
    name: string;
    content: string;
    type: 'Email' | 'SMS' | 'Other';
    createdAt: Date;
    updatedAt: Date;
}

const TemplateSchema: Schema = new Schema({
    name: { type: String, required: true },
    content: { type: String, required: true },
    type: { type: String, enum: ['Email', 'SMS', 'Other'], default: 'Email' },
}, { timestamps: true });

export default mongoose.model<ITemplate>('Template', TemplateSchema);
