// src/routes/invoices.js
const express = require('express');
const router = express.Router();
const { getInvoices, createInvoice, getInvoiceById, updateInvoice, deleteInvoice } = require('../controllers/invoiceController');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.get('/', authenticateToken, getInvoices);
router.get('/:id', authenticateToken, getInvoiceById);
router.post('/', authenticateToken, requireRole(['doctor', 'secretary']), createInvoice);
router.put('/:id', authenticateToken, requireRole(['doctor', 'secretary', 'cajera']), updateInvoice);
router.delete("/:id", authenticateToken, requireRole(["doctor", "secretary"]), deleteInvoice);

module.exports = router;
