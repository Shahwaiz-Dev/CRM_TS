import mongoose, { Schema, Document } from 'mongoose';

export interface IColumn extends Document {
    title: string;
    status: string;
    order: number;
    color?: string;
}

const ColumnSchema: Schema = new Schema({
    title: { type: String, required: true },
    status: { type: String, required: true, unique: true },
    order: { type: Number, default: 0 },
    color: { type: String },
}, { timestamps: true });

export default mongoose.model<IColumn>('Column', ColumnSchema);
