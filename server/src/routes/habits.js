import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { getHabits, createHabit, deleteHabit, getStreak, updateHabit } from '../controllers/habitController.js';

const router = Router();

router.use(authMiddleware);

router.get('/', getHabits);
router.post('/', createHabit);
router.delete('/:id', deleteHabit);
router.get('/:habitId/streak', getStreak);
router.put('/:id', updateHabit);

export default router;