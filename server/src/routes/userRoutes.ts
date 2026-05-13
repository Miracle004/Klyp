import { Router } from 'express';
import { getSettings, updateSettings, getDevices, deleteDevice, deleteAllItems } from '../controllers/userController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.get('/settings', getSettings);
router.put('/settings', updateSettings);
router.get('/devices', getDevices);
router.delete('/devices/:id', deleteDevice);
router.delete('/items/all', deleteAllItems);

export default router;
