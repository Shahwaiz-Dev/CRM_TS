import type { Request, Response } from 'express';
import Payroll from '../models/Payroll.js';

export const getPayroll = async (req: Request, res: Response) => {
    try {
        const payroll = await Payroll.find().sort({ year: -1, month: -1 });
        res.json(payroll);
    } catch (err: any) {
        res.status(500).send('Server Error');
    }
};

export const addPayroll = async (req: Request, res: Response) => {
    try {
        const newPayroll = new Payroll(req.body);
        const payroll = await newPayroll.save();
        res.json(payroll);
    } catch (err: any) {
        res.status(500).send('Server Error');
    }
};

export const updatePayroll = async (req: Request, res: Response) => {
    try {
        const payroll = await Payroll.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!payroll) return res.status(404).json({ msg: 'Payroll record not found' });
        res.json(payroll);
    } catch (err: any) {
        res.status(500).send('Server Error');
    }
};
