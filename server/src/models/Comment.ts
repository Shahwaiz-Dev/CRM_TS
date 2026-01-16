import mongoose, { Schema, Document } from 'mongoose';

export interface IComment extends Document {
    ticketId: string;
    userId: string;
    userName?: string;
    content: string;
    type?: string;
    createdAt: Date;
    updatedAt: Date;
}

const CommentSchema: Schema = new Schema({
    ticketId: { type: String, required: true },
    userId: { type: String, required: true },
    userName: { type: String },
    content: { type: String, required: true },
    type: { type: String, default: 'text' },
}, { timestamps: true });

export default mongoose.model<IComment>('Comment', CommentSchema);
