import mongoose, { Schema, Document } from 'mongoose';

export interface IEmployee extends Document {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    department?: string;
    position?: string;
    salary?: number;
    joiningDate?: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
}

const EmployeeSchema: Schema = new Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    department: { type: String },
    position: { type: String },
    salary: { type: Number },
    joiningDate: { type: String },
    status: { type: String, default: 'Active' },
}, { timestamps: true });

export default mongoose.model<IEmployee>('Employee', EmployeeSchema);
