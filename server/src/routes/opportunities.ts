import express from 'express';
import { getOpportunities, addOpportunity, updateOpportunity, deleteOpportunity } from '../controllers/opportunityController.js';

const router = express.Router();

router.get('/', getOpportunities);
router.post('/', addOpportunity);
router.put('/:id', updateOpportunity);
router.delete('/:id', deleteOpportunity);

export default router;
