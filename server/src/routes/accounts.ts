import express from 'express';
import { getAccounts, addAccount, updateAccount } from '../controllers/accountController.js';

const router = express.Router();

router.get('/', getAccounts);
router.post('/', addAccount);
router.put('/:id', updateAccount);

export default router;
