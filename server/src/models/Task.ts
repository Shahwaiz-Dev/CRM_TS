import mongoose, { Schema, Document } from 'mongoose';

export interface ITask extends Document {
    title: string;
    description?: string;
    status: string;
    priority: string;
    dueDate?: string;
    assignedTo?: string;
    relatedTo?: string | {
        modelId: string;
        modelName: string;
    };
    createdAt: Date;
    updatedAt: Date;
}

const TaskSchema: Schema = new Schema({
    title: { type: String, required: true },
    description: { type: String },
    status: { type: String, default: 'Not Started' },
    priority: { type: String, default: 'Medium' },
    dueDate: { type: String },
    assignedTo: { type: String },
    relatedTo: { type: Schema.Types.Mixed }
}, { timestamps: true });

export default mongoose.model<ITask>('Task', TaskSchema);
