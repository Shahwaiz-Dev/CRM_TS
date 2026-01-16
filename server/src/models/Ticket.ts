import mongoose, { Schema, Document } from 'mongoose';

export interface ITicket extends Document {
    key: string;
    number: number;
    title: string;
    description?: string;
    status: string;
    priority: string;
    type: string;
    assigneeId?: string;
    assignee?: string;
    reporterId?: string;
    sprintId?: string;
    labelIds?: string[];
    commentCount: number;
    position: number;
    timeEstimate?: number;
    estimatedTime?: string;
    createdAt: Date;
    updatedAt: Date;
}

const TicketSchema: Schema = new Schema({
    key: { type: String, required: true, unique: true },
    number: { type: Number, required: true },
    title: { type: String, required: true },
    description: { type: String },
    status: { type: String, default: 'Todo' },
    priority: { type: String, default: 'Medium' },
    type: { type: String, default: 'Task' },
    assigneeId: { type: String },
    assignee: { type: String },
    reporterId: { type: String },
    sprintId: { type: String },
    labelIds: [{ type: String }],
    commentCount: { type: Number, default: 0 },
    position: { type: Number, default: 0 },
    timeEstimate: { type: Number },
    estimatedTime: { type: String },
}, { timestamps: true });

export default mongoose.model<ITicket>('Ticket', TicketSchema);
