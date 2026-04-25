# Movie Ticket Booking System

A robust, full-stack Movie Ticket Booking application designed with a strong emphasis on database management, transaction integrity, and modern frontend user experiences. This project seamlessly connects a relational database architecture with an intuitive Next.js web application.

## Overview

This project was built to demonstrate proficiency in Database Management Systems (DBMS). The application architecture strictly maps complex physical world constraints (Seats, Screens, Theaters, Dynamic Pricing) into normalized SQL tables.

While the primary focus is database relations, structural queries, and data integrity, the system integrates a production-ready API built in Express and a high-performance, fully responsive user interface built using Next.js and Tailwind CSS.

## Features

- **Relational Integrity**: Strict foreign key constraints and standard normalization across 8 tables.
- **Dynamic Pricing Engine**: Automated detection of "Recliner" tier seats applying immediate mathematical price computations dynamically scaling baseline costs.
- **Transactional Capacity Arrays**: A booking controller that processes arbitrary arrays of highly contended seats using loop-safe locking structures to prevent double bookings.
- **Administrative SQL UI**: A React-abstracted database interface allowing direct execution of `SELECT`, `UPDATE`, `ALTER`, and `DROP` commands, table fetching, and CSV chunk imports directly in the browser.
- **Beautiful User Interface**: A cinematic UI featuring active high-res imagery, custom loaders, standard and recliner seat differentiation, and dynamic grid mappings.

## Database Schema

The core of the application relies on the `movie_booking` database. The architecture operates under a normalized paradigm optimizing for data deduplication.

### DDL Definitions

```sql
CREATE DATABASE IF NOT EXISTS movie_booking;
USE movie_booking;

CREATE TABLE Movies (
    movie_id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(100),
    duration INT,
    language VARCHAR(50)
);

CREATE TABLE Theaters (
    theater_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100),
    location VARCHAR(100)
);

CREATE TABLE Screens (
    screen_id INT PRIMARY KEY AUTO_INCREMENT,
    theater_id INT,
    screen_name VARCHAR(50),
    FOREIGN KEY (theater_id) REFERENCES Theaters(theater_id)
);

CREATE TABLE Shows (
    show_id INT PRIMARY KEY AUTO_INCREMENT,
    movie_id INT,
    screen_id INT,
    show_time DATETIME,
    price DECIMAL(6,2),
    FOREIGN KEY (movie_id) REFERENCES Movies(movie_id),
    FOREIGN KEY (screen_id) REFERENCES Screens(screen_id)
);

CREATE TABLE Seats (
    seat_id INT PRIMARY KEY AUTO_INCREMENT,
    show_id INT,
    seat_number VARCHAR(10),
    is_booked BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (show_id) REFERENCES Shows(show_id)
);

CREATE TABLE Users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100),
    email VARCHAR(100)
);

CREATE TABLE Bookings (
    booking_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    show_id INT,
    seat_id INT,
    booking_time DATETIME,
    FOREIGN KEY (user_id) REFERENCES Users(user_id),
    FOREIGN KEY (show_id) REFERENCES Shows(show_id),
    FOREIGN KEY (seat_id) REFERENCES Seats(seat_id)
);

CREATE TABLE Auth (
    auth_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    password VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);
```

## Setup Instructions

### Environment Configuration
1. Navigate to the `/server` directory and create a `.env` file.
2. Provide your database credentials:
```env
DB_HOST=127.0.0.1
DB_USER=your_db_username
DB_PASSWORD=your_db_password
DB_NAME=movie_booking
JWT_SECRET=your_jwt_secret_key
```

### Installation
Ensure Node.js and MySQL (or MariaDB) are installed on your system.
1. Run `npm install` in the project root to install the concurrent router.
2. Run `npm install` inside `/server` to install backend dependencies.
3. Run `npm install` inside `/client` to install frontend dependencies.

### Database Seeding
To initialize the schema and populate thousands of dynamic, randomly curated seats and blockbuster data:
```bash
cd server
node generate-seed.js
mysql -u root -p < full-seed.sql
```

### Running the Application
From the root directory of the application:
```bash
npm run dev
```
This single command spins up both the Express API and the Next.js Client concurrently.
Navigate to `http://localhost:3000` to interact with the consumer web application.

## Developer Administration
The application seeds an Administrative account. Login at `/login` using the credentials:
- **Email**: admin@example.com
- **Password**: admin123

Upon login, you are automatically redirected to an isolated Database Console UI allowing raw schema mutations.
