import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { getCheckins, createCheckin, deleteCheckin } from '../controllers/habitController.js';

const router = Router();

router.use(authMiddleware);

router.get('/', getCheckins);
router.post('/', createCheckin);
router.delete('/:id', deleteCheckin);

export default router;