import type { Request, Response } from 'express';
import Contact from '../models/Contact.js';

export const getContacts = async (req: Request, res: Response) => {
    try {
        const contacts = await Contact.find().sort({ createdAt: -1 });
        res.json(contacts);
    } catch (err: any) {
        res.status(500).send('Server Error');
    }
};

export const addContact = async (req: Request, res: Response) => {
    try {
        const newContact = new Contact(req.body);
        const contact = await newContact.save();
        res.json(contact);
    } catch (err: any) {
        res.status(500).send('Server Error');
    }
};

export const updateContact = async (req: Request, res: Response) => {
    try {
        const contact = await Contact.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!contact) return res.status(404).json({ msg: 'Contact not found' });
        res.json(contact);
    } catch (err: any) {
        res.status(500).send('Server Error');
    }
};

export const deleteContact = async (req: Request, res: Response) => {
    try {
        const contact = await Contact.findByIdAndDelete(req.params.id);
        if (!contact) return res.status(404).json({ msg: 'Contact not found' });
        res.json({ msg: 'Contact removed' });
    } catch (err: any) {
        res.status(500).send('Server Error');
    }
};
