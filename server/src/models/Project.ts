import mongoose, { Schema, Document } from 'mongoose';

export interface IProject extends Document {
    name: string;
    description?: string;
    status: 'Planning' | 'Active' | 'On Hold' | 'Completed';
    createdAt: Date;
    updatedAt: Date;
}

const ProjectSchema: Schema = new Schema({
    name: { type: String, required: true },
    description: { type: String },
    status: { type: String, default: 'Planning' },
}, { timestamps: true });

export default mongoose.model<IProject>('Project', ProjectSchema);
