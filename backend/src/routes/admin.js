import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { addQuestion, checkAdmin, updateQuestion, deleteQuestion } from '../controllers/adminController.js';
import { adminMiddleware } from '../middleware/adminMiddleware.js';

const router = Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'))
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9)
    const ext = path.extname(file.originalname)
    cb(null, `${unique}${ext}`)
  }
})
const upload = multer({ storage })

// Keep admin check for compatibility, but posting questions is open to any authenticated user
router.get('/check', authMiddleware, adminMiddleware, checkAdmin);
router.post('/questions', authMiddleware, adminMiddleware, upload.array('images', 6), addQuestion);
router.put('/questions/:id', authMiddleware, adminMiddleware, upload.array('images', 6), updateQuestion);
router.delete('/questions/:id', authMiddleware, adminMiddleware, deleteQuestion);

export default router;


