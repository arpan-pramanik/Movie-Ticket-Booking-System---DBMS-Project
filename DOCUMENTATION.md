# Movie Ticket Booking System - Project Report

## 1. Abstract
The Movie Ticket Booking System is a comprehensive web-based application architected to simplify the reservation of cinema seats. This project serves as an extensive demonstration of Database Management System (DBMS) concepts, merging structured querying constraints with modern web technologies. The platform enables users to browse blockbuster titles, parse real-time theater schedules, interact with dynamic seat selection layouts mapping exactly to the backend database structures, and confirm transactions securely. 

Furthermore, the system abstracts advanced SQL capabilities into a specialized Administrative Dashboard, enabling direct database exploration, table observation, CSV schema migrations, and arbitrary SQL executions through the client boundary.

## 2. Technology Stack
**Database Layer**: MySQL / MariaDB  
**Operating Server Engine**: Node.js  
**Backend Framework**: Express.js  
**Frontend Framework**: Next.js (React) built with TypeScript  
**UI Styling**: Tailwind CSS  

## 3. Database Design

### 3.1 Normalization and Strategy
The database architecture was designed targeting the Third Normal Form (3NF). Data redundancy is strictly minimized by breaking broad entities (such as "Theaters with Movies") into specific relational units joined by relational mappings.  

### 3.2 Schema Definition Overview
1. **Users**: Core entity containing identification attributes (Name, Email).
2. **Auth**: Segregated security table storing password hashes mapped exactly 1-to-1 against `Users.user_id` to reduce scanning latency on the main Users table.
3. **Movies**: Stores domain definitions (Titles, Duration, Language).
4. **Theaters & Screens**: A 1-to-N hierarchy where Theaters map to regions, and Screens act as individual physical domains localized inside a Theater.
5. **Shows**: The central node mapping a standard spatial-temporal occurrence connecting `Movies`, `Screens`, and explicit `DateTimes`.
6. **Seats**: An intensive mapped array scaling upwards of 700 units per show, delineating spatial locations (A1, R5) and boolean triggers for reservation states.
7. **Bookings**: The transaction ledger. Ties an explicit user to an explicit show and an exact seat at a distinct booking time. 

### 3.3 Dynamic Queries and Relations
Critical operations rely heavily on structured joins rather than redundant data tracking. For example, fetching a user's transaction history invokes a comprehensive query:

```sql
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
ORDER BY b.booking_time DESC;
```
This specific query exemplifies the robustness of the relational mesh, executing rapidly across indexed secondary keys to render the historical frontend dynamically.

## 4. Specific Business Logic Implementation

### 4.1 Transaction Integrity in Booking
Database races are an inherent threat in scheduling applications. When the API payload triggers `/book`, the system performs multi-row validation against the `Seats` table evaluating `is_booked` explicitly before proceeding. It evaluates the exact volume of seat_ids mathematically against the returning queries. 

If any mismatch or conflict exists, the transaction fails out linearly, protecting the system from double reservations. 

### 4.2 Dynamic Frontend Pricing Scaling
A significant operational parameter is the "Tiered Pricing" strategy implemented algorithmically. Without modifying structural table capacities or slowing down the database with conditional `IF` schema triggers, the application implements tier classifications via seat nomenclatures (`R`-prefix indicates Recliner). Upon visualization and checking out, the UI calculates the base static price queried from `Shows` and dynamically iterates the Recliner mathematical premium.

## 5. Administrative Controls

The system deploys a unified operational dashboard targeted toward system administrators that maps completely securely via JSON Web Token verification logic. An account marked generically as an administrative delegate (`admin@example.com`) acts as the operator. 

- **Table Explorers**: Executes `SHOW TABLES` mapped against dynamically rendered HTML tables.
- **SQL Text Execution**: Executes arbitrary multi-statement string bodies allowing the administrator to perform `SELECT`, `UPDATE`, `ALTER`, or schema `DROP` directly against the database logic from the front-end string parameter.
- **CSV Data Migrants**: File parsing API bridging arbitrary CSV chunks directly into recursive parameter matrices to perform instantaneous BULK `INSERT INTO` SQL statements asynchronously.

## 6. Conclusion
The Movie Ticket Booking System successfully integrates deep conceptual Database configurations inside a fast, accessible standard platform. The complete disconnect between database schema implementations, rigid API structure processing boundaries, and responsive frontend component abstractions demonstrates standard modern stack proficiency, securing data structures concurrently under pressure constraints from simulated massive scale environments.
