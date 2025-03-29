// routes/customer.js
import { Router } from 'express';
import {
    getAllCustomers,
    getCustomerByUserId,
    createCustomer,
    updateCustomer,
    deleteCustomer
} from '../controllers/customerController.js';

const router = Router();

// GET all customers
router.get('/', getAllCustomers);

// GET single customer by user_id
router.get('/:userId', getCustomerByUserId);

// CREATE customer record
router.post('/', createCustomer);

// UPDATE customer record
router.put('/:userId', updateCustomer);

// DELETE customer record
router.delete('/:userId', deleteCustomer);

export default router;
