import express from 'express';
import { getLabels, addLabel, updateLabel, deleteLabel } from '../controllers/labelController.js';

const router = express.Router();

router.get('/', getLabels);
router.post('/', addLabel);
router.put('/:id', updateLabel);
router.delete('/:id', deleteLabel);

export default router;
