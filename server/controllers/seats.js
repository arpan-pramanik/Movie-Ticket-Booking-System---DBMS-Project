const pool = require('../db');

// GET /seats/:show_id — available seats for a show
const getAvailableSeats = async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT * FROM Seats WHERE show_id = ? AND is_booked = FALSE',
            [req.params.show_id]
        );
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch seats' });
    }
};

// GET /seats/all/:show_id — all seats for a show (for grid display)
const getAllSeats = async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT * FROM Seats WHERE show_id = ?',
            [req.params.show_id]
        );
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch seats' });
    }
};

module.exports = { getAvailableSeats, getAllSeats };
