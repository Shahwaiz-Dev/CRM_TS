import type { Request, Response } from 'express';
import Sprint from '../models/Sprint.js';

export const getSprints = async (req: Request, res: Response) => {
    try {
        const sprints = await Sprint.find().sort({ createdAt: -1 });
        res.json(sprints);
    } catch (err: any) {
        res.status(500).send('Server Error');
    }
};

export const addSprint = async (req: Request, res: Response) => {
    try {
        const newSprint = new Sprint(req.body);
        const sprint = await newSprint.save();
        res.json(sprint);
    } catch (err: any) {
        res.status(500).send('Server Error');
    }
};


export const updateSprint = async (req: Request, res: Response) => {
    try {
        const sprint = await Sprint.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!sprint) return res.status(404).json({ msg: 'Sprint not found' });
        res.json(sprint);
    } catch (err: any) {
        res.status(500).send('Server Error');
    }
};

export const deleteSprint = async (req: Request, res: Response) => {
    try {
        const sprint = await Sprint.findByIdAndDelete(req.params.id);
        if (!sprint) return res.status(404).json({ msg: 'Sprint not found' });
        res.json({ msg: 'Sprint removed' });
    } catch (err: any) {
        res.status(500).send('Server Error');
    }
};

