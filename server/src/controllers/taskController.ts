import type { Request, Response } from 'express';
import Task from '../models/Task.js';

export const getTasks = async (req: Request, res: Response) => {
    try {
        const tasks = await Task.find().sort({ dueDate: 1 });
        res.json(tasks);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};

export const addTask = async (req: Request, res: Response) => {
    const task = new Task(req.body);
    try {
        const newTask = await task.save();
        res.status(201).json(newTask);
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
};

export const updateTask = async (req: Request, res: Response) => {
    try {
        const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedTask);
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
};

export const deleteTask = async (req: Request, res: Response) => {
    try {
        await Task.findByIdAndDelete(req.params.id);
        res.json({ message: 'Task deleted' });
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};
