const pool = require('../db');

// GET /shows — all shows with movie + theater + screen info
const getAllShows = async (req, res) => {
    try {
        const [rows] = await pool.query(`
      SELECT s.show_id, s.show_time, s.price,
             m.movie_id, m.title, m.duration, m.language, m.poster_url,
             sc.screen_name,
             t.name AS theater_name, t.location
      FROM Shows s
      JOIN Movies m ON s.movie_id = m.movie_id
      JOIN Screens sc ON s.screen_id = sc.screen_id
      JOIN Theaters t ON sc.theater_id = t.theater_id
      ORDER BY s.show_time
    `);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch shows' });
    }
};

// GET /shows/:id — single show details
const getShowById = async (req, res) => {
    try {
        const [rows] = await pool.query(`
      SELECT s.show_id, s.show_time, s.price,
             m.movie_id, m.title, m.duration, m.language, m.poster_url,
             sc.screen_name,
             t.name AS theater_name, t.location
      FROM Shows s
      JOIN Movies m ON s.movie_id = m.movie_id
      JOIN Screens sc ON s.screen_id = sc.screen_id
      JOIN Theaters t ON sc.theater_id = t.theater_id
      WHERE s.show_id = ?
    `, [req.params.id]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Show not found' });
        }
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch show' });
    }
};

module.exports = { getAllShows, getShowById };
