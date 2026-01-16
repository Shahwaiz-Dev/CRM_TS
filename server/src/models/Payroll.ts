import mongoose, { Schema, Document } from 'mongoose';

export interface IPayroll extends Document {
    employeeId: string;
    month: string;
    year: number | string;
    basicSalary: number;
    allowances?: number;
    deductions?: number;
    netSalary: number;
    status: string;
    paymentDate?: string;
    createdAt: Date;
    updatedAt: Date;
}

const PayrollSchema: Schema = new Schema({
    employeeId: { type: String, required: true },
    month: { type: String, required: true },
    year: { type: Schema.Types.Mixed, required: true },
    basicSalary: { type: Number, required: true },
    allowances: { type: Number, default: 0 },
    deductions: { type: Number, default: 0 },
    netSalary: { type: Number, required: true },
    status: { type: String, default: 'Pending' },
    paymentDate: { type: String },
}, { timestamps: true });

export default mongoose.model<IPayroll>('Payroll', PayrollSchema);
