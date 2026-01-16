import type { Request, Response } from 'express';
import Account from '../models/Account.js';

export const getAccounts = async (req: Request, res: Response) => {
    try {
        const accounts = await Account.find().sort({ createdAt: -1 });
        res.json(accounts);
    } catch (err: any) {
        res.status(500).send('Server Error');
    }
};

export const addAccount = async (req: Request, res: Response) => {
    try {
        const newAccount = new Account(req.body);
        const account = await newAccount.save();
        res.json(account);
    } catch (err: any) {
        res.status(500).send('Server Error');
    }
};

export const updateAccount = async (req: Request, res: Response) => {
    try {
        const account = await Account.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!account) return res.status(404).json({ msg: 'Account not found' });
        res.json(account);
    } catch (err: any) {
        res.status(500).send('Server Error');
    }
};
