import express from 'express';
import { getTemplates, addTemplate, updateTemplate, deleteTemplate } from '../controllers/templateController.js';

const router = express.Router();

router.get('/', getTemplates);
router.post('/', addTemplate);
router.put('/:id', updateTemplate);
router.delete('/:id', deleteTemplate);

export default router;
