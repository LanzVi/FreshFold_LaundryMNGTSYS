import { Router } from 'express';
import { getAllServices } from './service.controller';

const router = Router();

// Public route so customers can view prices before logging in
router.get('/', getAllServices);

export default router;