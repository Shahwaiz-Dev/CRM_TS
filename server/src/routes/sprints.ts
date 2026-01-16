import express from 'express';
import { getSprints, addSprint, updateSprint, deleteSprint } from '../controllers/sprintController.js';

const router = express.Router();

router.get('/', getSprints);
router.post('/', addSprint);
router.put('/:id', updateSprint);
router.delete('/:id', deleteSprint);

export default router;
