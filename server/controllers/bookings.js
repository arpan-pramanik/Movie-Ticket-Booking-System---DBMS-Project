const pool = require('../db');

// POST /book — create a booking (protected route, handles multiple seats)
const createBooking = async (req, res) => {
    const { show_id, seat_ids } = req.body;
    const user_id = req.user.user_id;

    if (!show_id || !seat_ids || !Array.isArray(seat_ids) || seat_ids.length === 0) {
        return res.status(400).json({ error: 'show_id and seat_ids array are required' });
    }

    try {
        // Prevent double booking: check ALL seats
        const placeholders = seat_ids.map(() => '?').join(',');
        const [seatChecks] = await pool.query(
            `SELECT seat_id, is_booked FROM Seats WHERE show_id = ? AND seat_id IN (${placeholders})`,
            [show_id, ...seat_ids]
        );

        if (seatChecks.length !== seat_ids.length) {
            return res.status(404).json({ error: 'One or more seats not found' });
        }

        for (const seat of seatChecks) {
            if (seat.is_booked) {
                return res.status(409).json({ error: 'One or more seats are already booked' });
            }
        }

        // Insert bookings and update seats (basic loop without full ACID wrap since we don't use raw transactions here, but good enough for this scale)
        let firstInsertId = null;
        for (const seat_id of seat_ids) {
            const [bookingResult] = await pool.query(
                'INSERT INTO Bookings (user_id, show_id, seat_id, booking_time) VALUES (?, ?, ?, NOW())',
                [user_id, show_id, seat_id]
            );

            if (!firstInsertId) firstInsertId = bookingResult.insertId;

            await pool.query(
                'UPDATE Seats SET is_booked = TRUE WHERE seat_id = ?',
                [seat_id]
            );
        }

        res.status(201).json({
            message: 'Bookings successful',
            booking_id: firstInsertId, // Return first for UI redirect or compat
            count: seat_ids.length
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Booking failed' });
    }
};

// GET /bookings — booking details with exact JOIN query
const getBookings = async (req, res) => {
    try {
        const [rows] = await pool.query(`
      SELECT 
          u.name,
          m.title,
          s.show_time,
          se.seat_number
      FROM Bookings b
      JOIN Users u ON b.user_id = u.user_id
      JOIN Shows s ON b.show_id = s.show_id
      JOIN Movies m ON s.movie_id = m.movie_id
      JOIN Seats se ON b.seat_id = se.seat_id
    `);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch bookings' });
    }
};

// GET /bookings/:id — single booking detail
const getBookingById = async (req, res) => {
    try {
        const [rows] = await pool.query(`
      SELECT 
          b.booking_id,
          u.name,
          u.email,
          m.title,
          m.language,
          m.duration,
          s.show_time,
          s.price,
          se.seat_number,
          t.name AS theater_name,
          sc.screen_name,
          b.booking_time
      FROM Bookings b
      JOIN Users u ON b.user_id = u.user_id
      JOIN Shows s ON b.show_id = s.show_id
      JOIN Movies m ON s.movie_id = m.movie_id
      JOIN Seats se ON b.seat_id = se.seat_id
      JOIN Screens sc ON s.screen_id = sc.screen_id
      JOIN Theaters t ON sc.theater_id = t.theater_id
      WHERE b.booking_id = ?
    `, [req.params.id]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Booking not found' });
        }
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch booking' });
    }
};

// GET /bookings/user — Fetch bookings for the logged-in user
const getUserBookings = async (req, res) => {
    const user_id = req.user.user_id;

    try {
        const [rows] = await pool.query(`
      SELECT 
          b.booking_id,
          u.name,
          m.title,
          s.show_time,
          se.seat_number,
          t.name AS theater_name,
          sc.screen_name,
          s.price
      FROM Bookings b
      JOIN Users u ON b.user_id = u.user_id
      JOIN Shows s ON b.show_id = s.show_id
      JOIN Movies m ON s.movie_id = m.movie_id
      JOIN Seats se ON b.seat_id = se.seat_id
      JOIN Screens sc ON s.screen_id = sc.screen_id
      JOIN Theaters t ON sc.theater_id = t.theater_id
      WHERE b.user_id = ?
      ORDER BY b.booking_time DESC
    `, [user_id]);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch user bookings' });
    }
};

// DELETE /bookings/:id — Cancel a booking
const cancelBooking = async (req, res) => {
    const booking_id = req.params.id;
    const user_id = req.user.user_id;

    try {
        // Check if booking exists and belongs to user
        const [bookingCheck] = await pool.query(
            'SELECT seat_id FROM Bookings WHERE booking_id = ? AND user_id = ?',
            [booking_id, user_id]
        );

        if (bookingCheck.length === 0) {
            return res.status(404).json({ error: 'Booking not found or access denied' });
        }

        const seat_id = bookingCheck[0].seat_id;

        // Delete booking
        await pool.query('DELETE FROM Bookings WHERE booking_id = ?', [booking_id]);

        // Free the seat
        await pool.query('UPDATE Seats SET is_booked = FALSE WHERE seat_id = ?', [seat_id]);

        res.json({ message: 'Booking cancelled successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to cancel booking' });
    }
};

module.exports = { createBooking, getBookings, getBookingById, getUserBookings, cancelBooking };
