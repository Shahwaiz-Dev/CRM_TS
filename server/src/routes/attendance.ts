import express from 'express';
import { getAttendance, addAttendance, updateAttendance } from '../controllers/attendanceController.js';

const router = express.Router();

router.get('/', getAttendance);
router.post('/', addAttendance);
router.put('/:id', updateAttendance);

export default router;
