import { Router } from 'express';
import { getAchievements } from '../controllers/achievementsController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();
router.get('/', authMiddleware, getAchievements);

export default router;