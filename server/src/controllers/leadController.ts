import type { Request, Response } from 'express';
import Lead from '../models/Lead.js';

export const getLeads = async (req: Request, res: Response) => {
    try {
        const leads = await Lead.find();
        res.json(leads);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};

export const addLead = async (req: Request, res: Response) => {
    const lead = new Lead(req.body);
    try {
        const newLead = await lead.save();
        res.status(201).json(newLead);
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
};

export const updateLead = async (req: Request, res: Response) => {
    try {
        const updatedLead = await Lead.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedLead);
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
};

export const deleteLead = async (req: Request, res: Response) => {
    try {
        await Lead.findByIdAndDelete(req.params.id);
        res.json({ message: 'Lead deleted' });
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};
