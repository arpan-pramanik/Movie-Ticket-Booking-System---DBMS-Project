const fs = require('fs');

const MOVIES = [
    { title: 'Inception', duration: 148, language: 'English' }, // 1
    { title: 'Interstellar', duration: 169, language: 'English' }, // 2
    { title: 'The Dark Knight', duration: 152, language: 'English' }, // 3
    { title: 'Parasite', duration: 132, language: 'Korean' }, // 4
    { title: 'Dune: Part Two', duration: 166, language: 'English' }, // 5
    { title: 'Oppenheimer', duration: 180, language: 'English' }, // 6
    { title: 'RRR', duration: 187, language: 'Telugu' }, // 7
    { title: 'Spirited Away', duration: 125, language: 'Japanese' }, // 8
    { title: 'Avatar', duration: 162, language: 'English' }, // 9
    { title: 'The Matrix', duration: 136, language: 'English' }, // 10
    { title: 'Gladiator', duration: 155, language: 'English' }, // 11
    { title: 'Avengers: Endgame', duration: 181, language: 'English' } // 12
];

// 5 Screens
// 1 = CineMax Multiplex : Screen 1
// 2 = CineMax Multiplex : Screen 2
// 3 = Starlight Cinemas : Audi 1
// 4 = Starlight Cinemas : Audi 2
// 5 = Galaxy IMAX     : IMAX Hall

const SHOWS = [
    { m_id: 1, sc_id: 1, time: '2026-04-26 10:00:00', price: 250 },
    { m_id: 6, sc_id: 1, time: '2026-04-26 14:00:00', price: 300 },
    { m_id: 2, sc_id: 2, time: '2026-04-26 11:30:00', price: 280 },
    { m_id: 8, sc_id: 2, time: '2026-04-26 15:30:00', price: 220 },
    { m_id: 3, sc_id: 3, time: '2026-04-26 13:00:00', price: 350 },
    { m_id: 7, sc_id: 3, time: '2026-04-26 17:00:00', price: 250 },
    { m_id: 4, sc_id: 4, time: '2026-04-26 15:00:00', price: 200 },
    { m_id: 5, sc_id: 5, time: '2026-04-26 18:00:00', price: 450 },
    { m_id: 9, sc_id: 5, time: '2026-04-26 22:00:00', price: 500 }, // IMAX Avatar
    { m_id: 10, sc_id: 4, time: '2026-04-27 10:00:00', price: 200 },
    { m_id: 11, sc_id: 3, time: '2026-04-27 12:00:00', price: 300 },
    { m_id: 12, sc_id: 5, time: '2026-04-27 15:00:00', price: 550 } // IMAX Avengers
];

let sql = `
-- Generated Seed File
USE movie_booking;

DELETE FROM Bookings;
DELETE FROM Seats;
DELETE FROM Shows;
DELETE FROM Movies;
DELETE FROM Screens;
DELETE FROM Theaters;

ALTER TABLE Movies AUTO_INCREMENT = 1;
ALTER TABLE Shows AUTO_INCREMENT = 1;
ALTER TABLE Seats AUTO_INCREMENT = 1;
ALTER TABLE Screens AUTO_INCREMENT = 1;
ALTER TABLE Theaters AUTO_INCREMENT = 1;
ALTER TABLE Bookings AUTO_INCREMENT = 1;

-- 12 MOVIES
INSERT INTO Movies (title, duration, language) VALUES
${MOVIES.map(m => `('${m.title}', ${m.duration}, '${m.language}')`).join(',\n')};

-- 3 THEATERS
INSERT INTO Theaters (name, location) VALUES
('CineMax Multiplex', 'Downtown'),
('Starlight Cinemas', 'Uptown'),
('Galaxy IMAX', 'City Center');

-- 5 SCREENS
INSERT INTO Screens (theater_id, screen_name) VALUES
(1, 'Screen 1'),
(1, 'Screen 2'),
(2, 'Audi 1'),
(2, 'Audi 2'),
(3, 'IMAX Hall');

-- ${SHOWS.length} SHOWS
INSERT INTO Shows (movie_id, screen_id, show_time, price) VALUES
${SHOWS.map(s => `(${s.m_id}, ${s.sc_id}, '${s.time}', ${s.price})`).join(',\n')};

`;

console.log("Generating Seats... This may take a moment.");

const generateSeatsForShow = (showId, isImax) => {
    const seats = [];
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const totalRows = isImax ? 26 : 14;
    const seatsPerRow = isImax ? 26 : 18; // IMAX: 26*26 = 676 normal. Reg: 14*18 = 252 normal.
    const reclinerRows = isImax ? 2 : 1;
    const reclinersPerRow = isImax ? 12 : 8;

    // Normal Seats
    for (let r = 0; r < totalRows; r++) {
        let rowLetter = alphabet[r];
        for (let s = 1; s <= seatsPerRow; s++) {
            seats.push(`(${showId}, '${rowLetter}${s}')`);
        }
    }

    // Recliner Seats (R prefixed)
    for (let r = 0; r < reclinerRows; r++) {
        let prefix = "R" + (r === 0 ? '' : 'R');
        for (let s = 1; s <= reclinersPerRow; s++) {
            seats.push(`(${showId}, '${prefix}${s}')`);
        }
    }
    return seats;
}

let seatChunks = [];
for (let i = 0; i < SHOWS.length; i++) {
    const showId = i + 1;
    const isImax = SHOWS[i].sc_id === 5;
    const seatsList = generateSeatsForShow(showId, isImax);

    // Batch inserts for performance
    const BATCH_SIZE = 500;
    for (let j = 0; j < seatsList.length; j += BATCH_SIZE) {
        const chunk = seatsList.slice(j, j + BATCH_SIZE);
        seatChunks.push(`INSERT INTO Seats (show_id, seat_number) VALUES\n${chunk.join(',\n')};`);
    }
}

sql += "\n-- MASSIVE SEATING INSERTS --\n";
sql += seatChunks.join('\n\n');

fs.writeFileSync('full-seed.sql', sql, 'utf8');
console.log("Done! Created full-seed.sql");
