import { Router } from 'express';
import multer from 'multer';
import { getItems, createItem, deleteItem, togglePin, uploadItem } from '../controllers/itemController';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const upload = multer({
	storage: multer.memoryStorage(),
	limits: { fileSize: 50 * 1024 * 1024 },
});

router.use(authenticateToken);

router.get('/', getItems);
router.post('/', createItem);
router.post('/upload', upload.single('file'), uploadItem);
router.delete('/:id', deleteItem);
router.patch('/:id/pin', togglePin);

export default router;
