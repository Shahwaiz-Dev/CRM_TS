import express from 'express';
import { getPayroll, addPayroll, updatePayroll } from '../controllers/payrollController.js';

const router = express.Router();

router.get('/', getPayroll);
router.post('/', addPayroll);
router.put('/:id', updatePayroll);

export default router;
