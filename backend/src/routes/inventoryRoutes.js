import express from 'express';
import {
  getInventory,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
} from '../controllers/inventoryController.js';
import { authenticate, optionalAuth } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/', optionalAuth, getInventory);
router.post('/', authenticate, authorize(['admin', 'kitchen']), createInventoryItem);
router.put('/:id', authenticate, authorize(['admin', 'kitchen']), updateInventoryItem);
router.delete('/:id', authenticate, authorize(['admin']), deleteInventoryItem);

export default router;
