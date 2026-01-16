import type { Request, Response } from 'express';
import LeaveRequest from '../models/LeaveRequest.js';

export const getLeaveRequests = async (req: Request, res: Response) => {
    try {
        const leaveRequests = await LeaveRequest.find().populate('employeeId');
        res.json(leaveRequests);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};

export const addLeaveRequest = async (req: Request, res: Response) => {
    const leaveRequest = new LeaveRequest(req.body);
    try {
        const newLeaveRequest = await leaveRequest.save();
        res.status(201).json(newLeaveRequest);
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
};

export const updateLeaveRequest = async (req: Request, res: Response) => {
    try {
        const updatedLeaveRequest = await LeaveRequest.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedLeaveRequest);
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
};

export const deleteLeaveRequest = async (req: Request, res: Response) => {
    try {
        await LeaveRequest.findByIdAndDelete(req.params.id);
        res.json({ message: 'Leave Request deleted' });
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};
