# Address Book Management Application

## Project Overview
This is a full-stack Address Book Management Application built to efficiently manage personal and professional contacts. It allows users to store rich contact details, dynamically assign categorical tags, and perform deep searches across the entire database.

## Features
- **CRUD Operations:** Complete Create, Read, Update, and Delete functionality for Contacts and Tags.
- **Dynamic Tagging:** Assign zero or more custom tags to contacts. Delete tags or create new ones on the fly.
- **Advanced Search:** Unified text search covering names, emails, phone numbers, and associated tags.
- **Pagination:** Database-level offset/limit pagination (20 records per page).
- **Data Validation:** Strict backend rules enforcing mandatory fields and valid formats, with identical frontend validations.
- **Responsive UI:** Clean, intuitive, and mobile-friendly interface built with React.

## Tech Stack
- **Frontend:** React, Vite, React Router, Axios, Vanilla CSS
- **Backend:** Node.js, Express, `mysql2`, `express-validator`
- **Database:** Local MySQL 8.x

## Architecture
This project follows a strict RESTful architecture. The React frontend interacts with the Node.js Express backend via Axios. The backend communicates directly with the MySQL database using raw, parameterized SQL queries via `mysql2/promise`. It utilizes database transactions to guarantee data integrity across junction tables (`contact_tags`).

## Prerequisites
- **Node.js** (v18 or higher)
- **MySQL Server** (8.0 or higher) running locally.

## Setup & Installation

### 1. Database Setup
Ensure your local MySQL server is running. Create an empty database:
```sql
CREATE DATABASE internship_address_book;
```
*(The schema has already been executed. If you need to recreate it, apply `schema.sql` to this database).*

### 2. Backend Configuration & Startup
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up the environment variables. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
4. Open the new `.env` file and update your MySQL password (`DB_PASS`). The other defaults should work.
5. Start the backend server:
   ```bash
   node src/index.js
   ```
   *(The server runs on `http://localhost:5000`)*

### 3. Frontend Configuration & Startup
1. Open a **new** terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *(The frontend runs on `http://localhost:5173`)*

## API Overview
The backend exposes the following REST endpoints at `http://localhost:5000/api`:
- **Contacts:**
  - `GET /contacts` (Query params: `page`, `limit`, `search`)
  - `GET /contacts/:id`
  - `POST /contacts`
  - `PUT /contacts/:id`
  - `DELETE /contacts/:id`
- **Tags:**
  - `GET /tags`
  - `POST /tags`
  - `DELETE /tags/:id`

## Project Structure
```
internship_address_book/
├── backend/          # Node/Express API
├── frontend/         # React/Vite UI
├── docs/             # Technical & Business Requirement Documents
├── README.md         # This file
└── schema.sql        # Database schema dump (for reference)
```
