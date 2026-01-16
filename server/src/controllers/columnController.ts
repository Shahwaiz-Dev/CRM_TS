import type { Request, Response } from 'express';
import Column from '../models/Column.js';

export const getColumns = async (req: Request, res: Response) => {
    try {
        let columns = await Column.find().sort({ order: 1 });

        // Seed default columns if none exist
        if (columns.length === 0) {
            const defaults = [
                { title: 'To Do', status: 'Todo', order: 0 },
                { title: 'In Progress', status: 'InProgress', order: 1 },
                { title: 'Review', status: 'Review', order: 2 },
                { title: 'Done', status: 'Done', order: 3 },
            ];
            columns = await Column.insertMany(defaults);
        }

        res.json(columns);
    } catch (err: any) {
        res.status(500).send('Server Error');
    }
};

export const addColumn = async (req: Request, res: Response) => {
    try {
        const newColumn = new Column(req.body);
        const column = await newColumn.save();
        res.json(column);
    } catch (err: any) {
        res.status(500).send('Server Error');
    }
};

export const updateColumn = async (req: Request, res: Response) => {
    try {
        const column = await Column.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(column);
    } catch (err: any) {
        res.status(500).send('Server Error');
    }
};

export const deleteColumn = async (req: Request, res: Response) => {
    try {
        await Column.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Column removed' });
    } catch (err: any) {
        res.status(500).send('Server Error');
    }
};
