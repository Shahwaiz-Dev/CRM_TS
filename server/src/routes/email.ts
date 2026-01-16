import express from 'express';
import { sendEmail } from '../controllers/emailController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Route is /api/email/send
router.post('/send', auth, sendEmail);

export default router;
