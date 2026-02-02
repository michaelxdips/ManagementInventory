import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import * as itemsController from '../controllers/itemsController.js';

const router = Router();

// GET /api/atk-items - List all items
router.get('/', authenticate, itemsController.getAllItems);

// GET /api/atk-items/:id - Get single item
router.get('/:id', authenticate, itemsController.getItemById);

// PUT /api/atk-items/:id - Update item (superadmin only)
router.put('/:id', authenticate, authorize('superadmin'), itemsController.updateItem);

// POST /api/atk-items - Create new item (superadmin only)
router.post('/', authenticate, authorize('superadmin'), itemsController.createItem);

export default router;
