import { Router } from 'express';
import { getWeeklyStats, getHabitsStats } from '../controllers/statsController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();
router.get('/weekly', authMiddleware, getWeeklyStats);
router.get('/habits',  authMiddleware, getHabitsStats);

export default router;