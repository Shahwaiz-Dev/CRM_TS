import express from 'express';
import { getColumns, addColumn, updateColumn, deleteColumn } from '../controllers/columnController.js';
import { auth, admin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', auth, getColumns);
router.post('/', [auth, admin], addColumn);
router.put('/:id', [auth, admin], updateColumn);
router.delete('/:id', [auth, admin], deleteColumn);

export default router;
