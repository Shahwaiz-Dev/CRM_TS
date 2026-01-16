import type { Request, Response } from 'express';
import Attendance from '../models/Attendance.js';

export const getAttendance = async (req: Request, res: Response) => {
    try {
        const attendance = await Attendance.find().sort({ date: -1 });
        res.json(attendance);
    } catch (err: any) {
        res.status(500).send('Server Error');
    }
};

export const addAttendance = async (req: Request, res: Response) => {
    try {
        const newAttendance = new Attendance(req.body);
        const attendance = await newAttendance.save();
        res.json(attendance);
    } catch (err: any) {
        res.status(500).send('Server Error');
    }
};

export const updateAttendance = async (req: Request, res: Response) => {
    try {
        const attendance = await Attendance.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!attendance) return res.status(404).json({ msg: 'Attendance record not found' });
        res.json(attendance);
    } catch (err: any) {
        res.status(500).send('Server Error');
    }
};
