import type { Request, Response } from 'express';
import Employee from '../models/Employee.js';

export const getEmployees = async (req: Request, res: Response) => {
    try {
        const employees = await Employee.find().sort({ createdAt: -1 });
        res.json(employees);
    } catch (err: any) {
        res.status(500).send('Server Error');
    }
};

export const addEmployee = async (req: Request, res: Response) => {
    try {
        const newEmployee = new Employee(req.body);
        const employee = await newEmployee.save();
        res.json(employee);
    } catch (err: any) {
        res.status(500).send('Server Error');
    }
};

export const updateEmployee = async (req: Request, res: Response) => {
    try {
        const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!employee) return res.status(404).json({ msg: 'Employee not found' });
        res.json(employee);
    } catch (err: any) {
        res.status(500).send('Server Error');
    }
};
