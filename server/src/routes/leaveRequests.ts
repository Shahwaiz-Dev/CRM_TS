import express from 'express';
import { getLeaveRequests, addLeaveRequest, updateLeaveRequest, deleteLeaveRequest } from '../controllers/leaveRequestController.js';

const router = express.Router();

router.get('/', getLeaveRequests);
router.post('/', addLeaveRequest);
router.put('/:id', updateLeaveRequest);
router.delete('/:id', deleteLeaveRequest);

export default router;
