const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/movies', require('./routes/movies'));
app.use('/shows', require('./routes/shows'));
app.use('/seats', require('./routes/seats'));
app.use('/', require('./routes/auth'));
app.use('/book', require('./routes/bookings'));
app.use('/bookings', require('./routes/bookings'));
app.use('/admin', require('./routes/admin'));

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
