import type { Request, Response } from 'express';
import Label from '../models/Label.js';

export const getLabels = async (req: Request, res: Response) => {
    try {
        const labels = await Label.find().sort({ name: 1 });
        res.json(labels);
    } catch (err: any) {
        res.status(500).send('Server Error');
    }
};

export const addLabel = async (req: Request, res: Response) => {
    try {
        const newLabel = new Label(req.body);
        const label = await newLabel.save();
        res.json(label);
    } catch (err: any) {
        res.status(500).send('Server Error');
    }
};

export const updateLabel = async (req: Request, res: Response) => {
    try {
        const label = await Label.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(label);
    } catch (err: any) {
        res.status(500).send('Server Error');
    }
};

export const deleteLabel = async (req: Request, res: Response) => {
    try {
        await Label.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Label removed' });
    } catch (err: any) {
        res.status(500).send('Server Error');
    }
};
