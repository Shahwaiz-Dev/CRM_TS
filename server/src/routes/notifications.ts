import express from 'express';
import { getNotifications, updateNotification, deleteNotification, addNotification } from '../controllers/notificationController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', auth, getNotifications);
router.post('/', auth, addNotification);
router.put('/:id', auth, updateNotification);
router.delete('/:id', auth, deleteNotification);

export default router;
