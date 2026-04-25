const express = require('express');
const router = express.Router();
const { getAllShows, getShowById } = require('../controllers/shows');

router.get('/', getAllShows);
router.get('/:id', getShowById);

module.exports = router;
