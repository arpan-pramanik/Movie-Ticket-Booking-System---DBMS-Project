const express = require('express');
const router = express.Router();
const { getAvailableSeats, getAllSeats } = require('../controllers/seats');

router.get('/all/:show_id', getAllSeats);
router.get('/:show_id', getAvailableSeats);

module.exports = router;
