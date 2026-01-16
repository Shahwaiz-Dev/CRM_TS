import type { Request, Response } from 'express';
import Project from '../models/Project.js';

export const getProjects = async (req: Request, res: Response) => {
    try {
        const projects = await Project.find().sort({ createdAt: -1 });
        res.json(projects);
    } catch (err: any) {
        res.status(500).send('Server Error');
    }
};

export const addProject = async (req: Request, res: Response) => {
    try {
        const newProject = new Project(req.body);
        const project = await newProject.save();
        res.json(project);
    } catch (err: any) {
        res.status(500).send('Server Error');
    }
};

export const updateProject = async (req: Request, res: Response) => {
    try {
        const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!project) return res.status(404).json({ msg: 'Project not found' });
        res.json(project);
    } catch (err: any) {
        res.status(500).send('Server Error');
    }
};
