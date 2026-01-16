import mongoose, { Schema, Document } from 'mongoose';

export interface ISprint extends Document {
    name: string;
    startDate?: string;
    endDate?: string;
    status: string;
    goal?: string;
    projectId?: string;
    createdAt: Date;
    updatedAt: Date;
}

const SprintSchema: Schema = new Schema({
    name: { type: String, required: true },
    startDate: { type: String },
    endDate: { type: String },
    status: { type: String, default: 'Planned' },
    goal: { type: String },
    projectId: { type: String },
}, { timestamps: true });

export default mongoose.model<ISprint>('Sprint', SprintSchema);
