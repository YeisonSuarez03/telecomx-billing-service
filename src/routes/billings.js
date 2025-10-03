import express from 'express';
import {
  createBilling,
  listBillings,
  getBilling,
  updateBilling,
  deleteBilling,
  getBillingsByUser
} from '../controllers/billingsController.js';

const router = express.Router();

// Create billing (requires userId and user must be active)
router.post('/', createBilling);

// List billings
router.get('/', listBillings);

// Get billing by billingId
router.get('/:id', getBilling);

// Update billing by billingId
router.put('/:id', updateBilling);

// Delete billing by billingId
router.delete('/:id', deleteBilling);

// Get billings for a specific user
router.get('/user/:userId', getBillingsByUser);

export default router;
