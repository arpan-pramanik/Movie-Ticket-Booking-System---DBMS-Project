const pool = require('../db');

// GET /movies
const getAllMovies = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Movies');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch movies' });
    }
};

module.exports = { getAllMovies };
