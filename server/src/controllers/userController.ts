import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const getUsers = async (req: Request, res: Response) => {
    try {
        const users = await User.find().sort({ createdAt: -1 }).select('-password');
        res.json(users);
    } catch (err: any) {
        res.status(500).send('Server Error');
    }
};

export const signup = async (req: Request, res: Response) => {
    const { email, password, name } = req.body;
    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        user = new User({
            email,
            password,
            name,
            role: 'new user'
        });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();

        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '24h' },
            (err, token) => {
                if (err) throw err;
                res.json({ token, user: { id: user?.id, email: user?.email, name: user?.name, role: user?.role } });
            }
        );
    } catch (err: any) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        if (!user.password) {
            return res.status(400).json({ msg: 'Account has no password. Please use Google Login or reset password.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '24h' },
            (err, token) => {
                if (err) throw err;
                res.json({ token, user: { id: user?.id, email: user?.email, name: user?.name, role: user?.role } });
            }
        );
    } catch (err: any) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

export const addUser = async (req: Request, res: Response) => {
    try {
        const newUser = new User(req.body);
        if (req.body.password) {
            const salt = await bcrypt.genSalt(10);
            newUser.password = await bcrypt.hash(req.body.password, salt);
        }
        const user = await newUser.save();
        const userResponse = user.toObject();
        delete userResponse.password;
        res.json(userResponse);
    } catch (err: any) {
        res.status(500).send('Server Error');
    }
};

export const updateUser = async (req: Request, res: Response) => {
    try {
        const updateData = { ...req.body };
        if (updateData.password) {
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(updateData.password, salt);
        }
        const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true }).select('-password');
        if (!user) return res.status(404).json({ msg: 'User not found' });
        res.json(user);
    } catch (err: any) {
        res.status(500).send('Server Error');
    }
};

export const deleteUser = async (req: Request, res: Response) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ msg: 'User not found' });
        res.json({ msg: 'User removed' });
    } catch (err: any) {
        res.status(500).send('Server Error');
    }
};

export const uploadPhoto = async (req: any, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ msg: 'No file uploaded' });
        }
        const userId = req.params.id;
        const photoURL = `/uploads/profile_pictures/${req.file.filename}`;

        const user = await User.findByIdAndUpdate(userId, { photoURL }, { new: true }).select('-password');
        if (!user) return res.status(404).json({ msg: 'User not found' });

        res.json(user);
    } catch (err: any) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};
