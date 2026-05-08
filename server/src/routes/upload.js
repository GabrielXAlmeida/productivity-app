import { Router } from 'express';
import multer from 'multer';
import { uploadTaskImage, deleteTaskImage } from '../controllers/uploadController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Apenas imagens são permitidas.'));
  },
});

const router = Router();
router.post('/:taskId/image',  authMiddleware, upload.single('image'), uploadTaskImage);
router.delete('/:taskId/image', authMiddleware, deleteTaskImage);

export default router;