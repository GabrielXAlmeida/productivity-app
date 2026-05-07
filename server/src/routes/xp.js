import { Router } from 'express';
import { getXp } from '../controllers/xpController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();
router.get('/', authMiddleware, getXp);

export default router;