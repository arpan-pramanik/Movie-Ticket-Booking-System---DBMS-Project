const express = require('express');
const router = express.Router();
const { executeRawQuery, getTables } = require('../controllers/admin');
const authMiddleware = require('../middleware/auth');

// Super simple Admin check middleware hook
const adminOnly = (req, res, next) => {
    if (req.user && req.user.email === 'arpan@admin.com') {
        next();
    } else {
        res.status(403).json({ error: 'Access denied: Admin privileges required' });
    }
};

// Protect admin routes
router.post('/query', authMiddleware, adminOnly, executeRawQuery);
router.get('/tables', authMiddleware, adminOnly, getTables);

module.exports = router;
