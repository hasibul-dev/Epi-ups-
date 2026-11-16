import { Router } from 'express';
import { authenticateToken, requireDepartment } from '../middleware/auth.js';

const router = Router();
router.use(authenticateToken);
router.use(requireDepartment('service'));

router.get('/status', (req, res) => {
  res.json({
    success: true,
    department: 'service',
    user: req.user.userId,
    status: 'operational',
  });
});

export default router;
