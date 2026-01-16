import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    email: string;
    password?: string;
    name?: string;
    role: 'admin' | 'user' | 'agent' | 'manager' | 'new user';
    photoURL?: string;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema: Schema = new Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String },
    name: { type: String },
    role: { type: String, enum: ['admin', 'user', 'agent', 'manager', 'new user'], default: 'new user' },
    photoURL: { type: String },
}, { timestamps: true });

export default mongoose.model<IUser>('User', UserSchema);
