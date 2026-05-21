import { Router } from 'express';
import { createOrder } from './order.controller';
import { authorize } from '../_middleware/authorize';

const router = Router();

// Only logged-in users ('User' role) can book a laundry slot
router.post('/', authorize(['User']), createOrder);

export default router;