import mongoose, { Schema, Document } from 'mongoose';

export interface ILabel extends Document {
    name: string;
    color: string;
    createdAt: Date;
    updatedAt: Date;
}

const LabelSchema: Schema = new Schema({
    name: { type: String, required: true, unique: true },
    color: { type: String, default: '#000000' },
}, { timestamps: true });

export default mongoose.model<ILabel>('Label', LabelSchema);
