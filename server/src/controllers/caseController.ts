import type { Request, Response } from 'express';
import Case from '../models/Case.js';

export const getCases = async (req: Request, res: Response) => {
    try {
        const cases = await Case.find().sort({ createdAt: -1 });
        res.json(cases);
    } catch (err: any) {
        res.status(500).send('Server Error');
    }
};

export const addCase = async (req: Request, res: Response) => {
    try {
        const newCase = new Case(req.body);
        const savedCase = await newCase.save();
        res.json(savedCase);
    } catch (err: any) {
        res.status(500).send('Server Error');
    }
};

export const updateCase = async (req: Request, res: Response) => {
    try {
        const updatedCase = await Case.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedCase) return res.status(404).json({ msg: 'Case not found' });
        res.json(updatedCase);
    } catch (err: any) {
        res.status(500).send('Server Error');
    }
};

export const deleteCase = async (req: Request, res: Response) => {
    try {
        const deletedCase = await Case.findByIdAndDelete(req.params.id);
        if (!deletedCase) return res.status(404).json({ msg: 'Case not found' });
        res.json({ msg: 'Case removed' });
    } catch (err: any) {
        res.status(500).send('Server Error');
    }
};
