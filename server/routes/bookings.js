const express = require('express');
const router = express.Router();
const { createBooking, getBookings, getBookingById, getUserBookings, cancelBooking } = require('../controllers/bookings');
const authMiddleware = require('../middleware/auth');

router.post('/', authMiddleware, createBooking);
router.get('/user', authMiddleware, getUserBookings);
router.delete('/:id', authMiddleware, cancelBooking);
router.get('/', getBookings);
router.get('/:id', getBookingById);

module.exports = router;
