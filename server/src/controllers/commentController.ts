import type { Request, Response } from 'express';
import Comment from '../models/Comment.js';
import Ticket from '../models/Ticket.js';

export const getComments = async (req: Request, res: Response) => {
    try {
        const { ticketId } = req.query;
        const query = ticketId ? { ticketId } : {};
        const comments = await Comment.find(query).sort({ createdAt: 1 });
        res.json(comments);
    } catch (err: any) {
        res.status(500).send('Server Error');
    }
};

export const addComment = async (req: Request, res: Response) => {
    try {
        const newComment = new Comment(req.body);
        const comment = await newComment.save();

        if (req.body.type !== 'system') {
            await Ticket.findByIdAndUpdate(req.body.ticketId, { $inc: { commentCount: 1 } });
        }

        res.json(comment);
    } catch (err: any) {
        res.status(500).send('Server Error');
    }
};

export const updateComment = async (req: Request, res: Response) => {
    try {
        const comment = await Comment.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(comment);
    } catch (err: any) {
        res.status(500).send('Server Error');
    }
};

export const deleteComment = async (req: Request, res: Response) => {
    try {
        const comment = await Comment.findById(req.params.id);
        if (!comment) return res.status(404).json({ msg: 'Comment not found' });

        const ticketId = comment.ticketId;
        const commentType = (comment as any).type;
        await Comment.findByIdAndDelete(req.params.id);

        if (commentType !== 'system') {
            await Ticket.findByIdAndUpdate(ticketId, { $inc: { commentCount: -1 } });
        }

        res.json({ msg: 'Comment removed' });
    } catch (err: any) {
        res.status(500).send('Server Error');
    }
};
