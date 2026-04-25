const pool = require('../db');

// Execute arbitrary RAW SQL query
const executeRawQuery = async (req, res) => {
    const { query } = req.body;

    if (!query) {
        return res.status(400).json({ error: 'Raw SQL query string is required' });
    }

    try {
        // Allows multi-statements if connection supports it, but standard queries work directly
        const [results, fields] = await pool.query(query);

        res.json({
            message: 'Query executed successfully',
            results,
            fields: fields ? fields.map(f => f.name) : []
        });
    } catch (err) {
        console.error('Raw Query Error:', err);
        res.status(400).json({ error: err.message || 'Failed to execute query' });
    }
};

// Get all tables in the database
const getTables = async (req, res) => {
    try {
        const [results] = await pool.query('SHOW TABLES');
        const tables = results.map(row => Object.values(row)[0]); // Extract table names

        res.json({ tables });
    } catch (err) {
        console.error('Show Tables Error:', err);
        res.status(500).json({ error: 'Failed to retrieve tables' });
    }
};

module.exports = { executeRawQuery, getTables };
