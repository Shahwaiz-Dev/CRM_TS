import type { Request, Response } from 'express';
import Template from '../models/Template.js';

export const getTemplates = async (req: Request, res: Response) => {
    try {
        const templates = await Template.find().sort({ name: 1 });
        res.json(templates);
    } catch (err: any) {
        res.status(500).send('Server Error');
    }
};

export const addTemplate = async (req: Request, res: Response) => {
    try {
        const newTemplate = new Template(req.body);
        const template = await newTemplate.save();
        res.json(template);
    } catch (err: any) {
        res.status(500).send('Server Error');
    }
};

export const updateTemplate = async (req: Request, res: Response) => {
    try {
        const template = await Template.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(template);
    } catch (err: any) {
        res.status(500).send('Server Error');
    }
};

export const deleteTemplate = async (req: Request, res: Response) => {
    try {
        await Template.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Template removed' });
    } catch (err: any) {
        res.status(500).send('Server Error');
    }
};
