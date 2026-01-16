import type { Request, Response } from 'express';
import Opportunity from '../models/Opportunity.js';

export const getOpportunities = async (req: Request, res: Response) => {
    try {
        const opportunities = await Opportunity.find().sort({ position: 1, createdAt: -1 });
        res.json(opportunities);
    } catch (err: any) {
        console.error('Error in getOpportunities:', err);
        res.status(500).send('Server Error');
    }
};

export const addOpportunity = async (req: Request, res: Response) => {
    try {
        const lastOpportunity = await Opportunity.findOne().sort({ position: -1 });
        const nextPosition = (lastOpportunity?.position || 0) + 1000;

        const newOpportunity = new Opportunity({
            ...req.body,
            position: nextPosition
        });
        const opportunity = await newOpportunity.save();
        res.json(opportunity);
    } catch (err: any) {
        console.error('Error in addOpportunity:', err);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
};

export const updateOpportunity = async (req: Request, res: Response) => {
    try {
        const opportunity = await Opportunity.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!opportunity) return res.status(404).json({ msg: 'Opportunity not found' });
        res.json(opportunity);
    } catch (err: any) {
        console.error('Error in updateOpportunity:', err);
        res.status(500).send('Server Error');
    }
};

export const deleteOpportunity = async (req: Request, res: Response) => {
    try {
        const opportunity = await Opportunity.findByIdAndDelete(req.params.id);
        if (!opportunity) return res.status(404).json({ msg: 'Opportunity not found' });
        res.json({ msg: 'Opportunity removed' });
    } catch (err: any) {
        console.error('Error in deleteOpportunity:', err);
        res.status(500).send('Server Error');
    }
};
