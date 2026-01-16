import mongoose, { Schema, Document } from 'mongoose';

export interface ILeaveRequest extends Document {
    employeeId: string;
    type: string;
    dateRange: string;
    reason?: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
}

const LeaveRequestSchema: Schema = new Schema({
    employeeId: { type: String, required: true },
    type: { type: String, required: true },
    dateRange: { type: String, required: true },
    reason: { type: String },
    status: { type: String, default: 'Pending' },
}, { timestamps: true });

export default mongoose.model<ILeaveRequest>('LeaveRequest', LeaveRequestSchema);
