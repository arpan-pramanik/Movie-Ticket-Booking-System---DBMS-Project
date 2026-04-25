USE movie_booking;

-- Movies
INSERT INTO Movies (title, duration, language) VALUES
('Inception', 148, 'English'),
('Interstellar', 169, 'English'),
('The Dark Knight', 152, 'English'),
('Parasite', 132, 'Korean'),
('Dune: Part Two', 166, 'English'),
('Oppenheimer', 180, 'English'),
('RRR', 187, 'Telugu'),
('Spirited Away', 125, 'Japanese');

-- Theaters
INSERT INTO Theaters (name, location) VALUES
('CineMax Multiplex', 'Downtown'),
('PVR Cinemas', 'Mall Road'),
('IMAX Theater', 'City Center');

-- Screens
INSERT INTO Screens (theater_id, screen_name) VALUES
(1, 'Screen 1'),
(1, 'Screen 2'),
(2, 'Audi 1'),
(2, 'Audi 2'),
(3, 'IMAX Hall');

-- Shows (Carefully spaced to prevent time overlaps on the same screen)
-- Screen overlaps to avoid: Screen 1 (ID 1), Screen 2 (ID 2), Audi 1 (ID 3), Audi 2 (ID 4), IMAX Hall (ID 5)
INSERT INTO Shows (movie_id, screen_id, show_time, price) VALUES
(1, 1, '2026-04-26 10:00:00', 250.00), -- Inception, Sc1
(6, 1, '2026-04-26 14:00:00', 300.00), -- Oppenheimer, Sc1, 4 hrs later
(2, 2, '2026-04-26 11:30:00', 280.00), -- Interstellar, Sc2
(8, 2, '2026-04-26 15:30:00', 220.00), -- Spirited Away, Sc2, 4 hrs later
(3, 3, '2026-04-26 13:00:00', 350.00), -- Dark Knight, Au1
(7, 3, '2026-04-26 17:00:00', 250.00), -- RRR, Au1, 4 hrs later
(4, 4, '2026-04-26 15:00:00', 200.00), -- Parasite, Au2
(5, 5, '2026-04-26 18:00:00', 450.00), -- Dune 2, IMAX
(1, 5, '2026-04-26 22:00:00', 500.00), -- Inception, IMAX, 4 hrs later
(5, 4, '2026-04-27 10:00:00', 450.00); -- Dune 2, Au2, next day

-- Seats for each show (12 seats per show: 10 normal, 2 Recliners)
-- Show 1
INSERT INTO Seats (show_id, seat_number) VALUES
(1, 'A1'), (1, 'A2'), (1, 'A3'), (1, 'A4'), (1, 'A5'),
(1, 'B1'), (1, 'B2'), (1, 'B3'), (1, 'B4'), (1, 'B5'),
(1, 'R1'), (1, 'R2');

-- Show 2
INSERT INTO Seats (show_id, seat_number) VALUES
(2, 'A1'), (2, 'A2'), (2, 'A3'), (2, 'A4'), (2, 'A5'),
(2, 'B1'), (2, 'B2'), (2, 'B3'), (2, 'B4'), (2, 'B5'),
(2, 'R1'), (2, 'R2');

-- Show 3
INSERT INTO Seats (show_id, seat_number) VALUES
(3, 'A1'), (3, 'A2'), (3, 'A3'), (3, 'A4'), (3, 'A5'),
(3, 'B1'), (3, 'B2'), (3, 'B3'), (3, 'B4'), (3, 'B5'),
(3, 'R1'), (3, 'R2');

-- Show 4
INSERT INTO Seats (show_id, seat_number) VALUES
(4, 'A1'), (4, 'A2'), (4, 'A3'), (4, 'A4'), (4, 'A5'),
(4, 'B1'), (4, 'B2'), (4, 'B3'), (4, 'B4'), (4, 'B5'),
(4, 'R1'), (4, 'R2');

-- Show 5
INSERT INTO Seats (show_id, seat_number) VALUES
(5, 'A1'), (5, 'A2'), (5, 'A3'), (5, 'A4'), (5, 'A5'),
(5, 'B1'), (5, 'B2'), (5, 'B3'), (5, 'B4'), (5, 'B5'),
(5, 'R1'), (5, 'R2');

-- Show 6
INSERT INTO Seats (show_id, seat_number) VALUES
(6, 'A1'), (6, 'A2'), (6, 'A3'), (6, 'A4'), (6, 'A5'),
(6, 'B1'), (6, 'B2'), (6, 'B3'), (6, 'B4'), (6, 'B5'),
(6, 'R1'), (6, 'R2');

-- Show 7
INSERT INTO Seats (show_id, seat_number) VALUES
(7, 'A1'), (7, 'A2'), (7, 'A3'), (7, 'A4'), (7, 'A5'),
(7, 'B1'), (7, 'B2'), (7, 'B3'), (7, 'B4'), (7, 'B5'),
(7, 'R1'), (7, 'R2');

-- Show 8
INSERT INTO Seats (show_id, seat_number) VALUES
(8, 'A1'), (8, 'A2'), (8, 'A3'), (8, 'A4'), (8, 'A5'),
(8, 'B1'), (8, 'B2'), (8, 'B3'), (8, 'B4'), (8, 'B5'),
(8, 'R1'), (8, 'R2');

-- Show 9
INSERT INTO Seats (show_id, seat_number) VALUES
(9, 'A1'), (9, 'A2'), (9, 'A3'), (9, 'A4'), (9, 'A5'),
(9, 'B1'), (9, 'B2'), (9, 'B3'), (9, 'B4'), (9, 'B5'),
(9, 'R1'), (9, 'R2');

-- Show 10
INSERT INTO Seats (show_id, seat_number) VALUES
(10, 'A1'), (10, 'A2'), (10, 'A3'), (10, 'A4'), (10, 'A5'),
(10, 'B1'), (10, 'B2'), (10, 'B3'), (10, 'B4'), (10, 'B5'),
(10, 'R1'), (10, 'R2');
