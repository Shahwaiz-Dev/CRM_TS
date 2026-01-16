import type { Request, Response } from 'express';
import Ticket from '../models/Ticket.js';
import Settings from '../models/Settings.js';

export const getTickets = async (req: Request, res: Response) => {
    try {
        const { sprintId } = req.query;
        const query = sprintId ? { sprintId } : {};
        const tickets = await Ticket.find(query).sort({ position: 1, createdAt: -1 });
        res.json(tickets);
    } catch (err: any) {
        res.status(500).send('Server Error');
    }
};

export const addTicket = async (req: Request, res: Response) => {
    try {
        // 1. Atomic increment of the counter
        let counter = await Settings.findOneAndUpdate(
            { key: 'ticketCounter' },
            { $inc: { 'value.count': 1 } },
            { new: true, upsert: true }
        );

        let nextNumber = counter.value.count;
        let ticketKey = `CRM-${nextNumber}`;

        // 2. Safety Check: If this key already exists, we are out of sync
        const existing = await Ticket.findOne({ key: ticketKey });
        if (existing) {
            console.warn(`Counter sync issue detected at CRM-${nextNumber}. Re-syncing...`);

            // Find the actual highest number in the database
            const lastTicket = await Ticket.findOne({}).sort({ number: -1 });
            const actualMax = lastTicket ? lastTicket.number : 0;

            nextNumber = actualMax + 1;
            ticketKey = `CRM-${nextNumber}`;

            // Update counter to the new corrected value
            await Settings.findOneAndUpdate(
                { key: 'ticketCounter' },
                { $set: { 'value.count': nextNumber } }
            );
        }

        const lastTicketByPos = await Ticket.findOne({}).sort({ position: -1 });
        const nextPosition = (lastTicketByPos?.position || 0) + 1000;

        const newTicket = new Ticket({
            ...req.body,
            key: ticketKey,
            number: nextNumber,
            position: nextPosition
        });

        const ticket = await newTicket.save();
        res.json(ticket);
    } catch (err: any) {
        console.error('Error adding ticket:', err);
        res.status(500).send('Server Error');
    }
};

export const updateTicket = async (req: Request, res: Response) => {
    try {
        const ticket = await Ticket.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!ticket) return res.status(404).json({ msg: 'Ticket not found' });
        res.json(ticket);
    } catch (err: any) {
        res.status(500).send('Server Error');
    }
};

export const deleteTicket = async (req: Request, res: Response) => {
    try {
        const ticket = await Ticket.findByIdAndDelete(req.params.id);
        if (!ticket) return res.status(404).json({ msg: 'Ticket not found' });
        res.json({ msg: 'Ticket removed' });
    } catch (err: any) {
        res.status(500).send('Server Error');
    }
};
