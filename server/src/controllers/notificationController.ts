import type { Request, Response } from 'express';
import Notification from '../models/Notification.js';

export const getNotifications = async (req: Request, res: Response) => {
    try {
        const notifications = await Notification.find().sort({ createdAt: -1 }).limit(50);
        res.json(notifications);
    } catch (err: any) {
        res.status(500).send('Server Error');
    }
};

export const updateNotification = async (req: Request, res: Response) => {
    try {
        const notification = await Notification.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!notification) return res.status(404).json({ msg: 'Notification not found' });
        res.json(notification);
    } catch (err: any) {
        res.status(500).send('Server Error');
    }
};

export const deleteNotification = async (req: Request, res: Response) => {
    try {
        const notification = await Notification.findByIdAndDelete(req.params.id);
        if (!notification) return res.status(404).json({ msg: 'Notification not found' });
        res.json({ msg: 'Notification removed' });
    } catch (err: any) {
        res.status(500).send('Server Error');
    }
};

export const addNotification = async (req: Request, res: Response) => {
    try {
        const newNotification = new Notification(req.body);
        const notification = await newNotification.save();
        res.json(notification);
    } catch (err: any) {
        res.status(500).send('Server Error');
    }
};
