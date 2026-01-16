import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
    title: string;
    body: string;
    type: 'general' | 'task' | 'deal' | 'comment';
    read: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const NotificationSchema: Schema = new Schema({
    title: { type: String, required: true },
    body: { type: String, required: true },
    type: { type: String, enum: ['general', 'task', 'deal', 'comment'], default: 'general' },
    read: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model<INotification>('Notification', NotificationSchema);
