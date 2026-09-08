const express = require('express');
const router = express.Router();
const { queryOne } = require('../db/database.cjs');
const { authenticateToken, requireCreator, requireBrand } = require('../middleware/auth.cjs');
const PaymentService = require('../services/PaymentService.cjs');

// GET /api/payments/config - Public Razorpay checkout configuration (Key ID, mode)
router.get('/config', (req, res) => {
    try {
        const config = PaymentService.getPublicConfig();
        return res.json({ success: true, ...config });
    } catch (err) {
        console.error('[PaymentRoutes] Error getting config:', err);
        return res.status(500).json({ success: false, error: 'Failed to retrieve payment configuration.' });
    }
});

// POST /api/payments/create-order - Brand initiates Escrow funding for a collaboration
router.post('/create-order', authenticateToken, requireBrand, async (req, res) => {
    try {
        const { collaboration_id, collaborationId } = req.body;
        const collabId = collaboration_id || collaborationId;

        if (!collabId) {
            return res.status(400).json({ success: false, error: 'collaboration_id is required.' });
        }

        const orderData = await PaymentService.createOrder({
            collaborationId: collabId,
            brandUserId: req.user.id
        });

        return res.json({ success: true, ...orderData });
    } catch (err) {
        console.error('[PaymentRoutes] Error creating payment order:', err.message);
        return res.status(400).json({ success: false, error: err.message });
    }
});

// POST /api/payments/verify - Server-side verification of Razorpay checkout signature
router.post('/verify', authenticateToken, requireBrand, async (req, res) => {
    try {
        const {
            collaboration_id,
            collaborationId,
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = req.body;

        const collabId = collaboration_id || collaborationId;

        if (!collabId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({
                success: false,
                error: 'Missing required parameters: collaboration_id, razorpay_order_id, razorpay_payment_id, and razorpay_signature.'
            });
        }

        const result = await PaymentService.verifyPayment({
            collaborationId: collabId,
            brandUserId: req.user.id,
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        });

        return res.json({ success: true, ...result });
    } catch (err) {
        console.error('[PaymentRoutes] Verification error:', err.message);
        return res.status(400).json({ success: false, error: err.message });
    }
});

// POST /api/payments/webhook - Razorpay asynchronous event notifications
router.post('/webhook', async (req, res) => {
    try {
        const signature = req.headers['x-razorpay-signature'];
        if (!signature) {
            return res.status(400).json({ success: false, error: 'Missing x-razorpay-signature header.' });
        }

        const rawBody = req.rawBody;
        if (!rawBody) {
            return res.status(400).json({ success: false, error: 'Raw request body unavailable for signature validation.' });
        }

        const result = await PaymentService.processWebhook({
            rawBody,
            signature,
            event: req.body
        });

        return res.json({ success: true, ...result });
    } catch (err) {
        console.error('[PaymentRoutes Webhook] Webhook processing failed:', err.message);
        return res.status(400).json({ success: false, error: err.message });
    }
});

// GET /api/payments/earnings - Creator earnings ledger
router.get('/earnings', authenticateToken, requireCreator, (req, res) => {
    try {
        const creator = queryOne('SELECT id FROM creator_profiles WHERE user_id = ?', [req.user.id]);
        if (!creator) return res.status(404).json({ success: false, error: 'Creator not found.' });

        const data = PaymentService.getCreatorEarnings(creator.id);
        return res.json({ success: true, ...data });
    } catch (err) {
        console.error('Error fetching earnings:', err);
        return res.status(500).json({ success: false, error: 'Failed to retrieve earnings.' });
    }
});

// POST /api/payments/release/:collabId - Brand releases escrow upon content approval
router.post('/release/:collabId', authenticateToken, requireBrand, async (req, res) => {
    try {
        const { collabId } = req.params;
        const brand = queryOne('SELECT id FROM brand_profiles WHERE user_id = ?', [req.user.id]);
        if (!brand) return res.status(403).json({ success: false, error: 'Unauthorized.' });

        const collab = queryOne('SELECT * FROM collaborations WHERE id = ? AND brand_id = ?', [collabId, brand.id]);
        if (!collab) return res.status(404).json({ success: false, error: 'Collaboration not found or unauthorized.' });

        const result = await PaymentService.releaseEscrow(collabId);
        return res.json({ success: true, message: 'Escrow payment released successfully.', result });
    } catch (err) {
        console.error('Error releasing escrow:', err);
        return res.status(400).json({ success: false, error: err.message });
    }
});

// GET /api/payments/:id - Fetch payment record detail
router.get('/:id', authenticateToken, (req, res) => {
    try {
        const payment = PaymentService.getPaymentById(req.params.id, req.user.id, req.user.role);
        return res.json({ success: true, payment });
    } catch (err) {
        return res.status(404).json({ success: false, error: err.message });
    }
});

module.exports = router;
