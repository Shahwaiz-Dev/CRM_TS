import mongoose, { Schema, Document } from 'mongoose';

export interface IAttendance extends Document {
    employeeId: string;
    date: string;
    status: string;
    checkIn?: string;
    checkOut?: string;
    createdAt: Date;
    updatedAt: Date;
}

const AttendanceSchema: Schema = new Schema({
    employeeId: { type: String, required: true },
    date: { type: String, required: true },
    status: { type: String, default: 'Present' },
    checkIn: { type: String },
    checkOut: { type: String },
}, { timestamps: true });

export default mongoose.model<IAttendance>('Attendance', AttendanceSchema);
