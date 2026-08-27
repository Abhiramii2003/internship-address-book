# Technical Requirements Document (TRD)
**Project Name:** Address Book Management Application

## 1. System Architecture
The application follows a standard three-tier architecture:
- **Presentation Layer:** Client-side rendering application built with React and Vite.
- **Application Layer:** RESTful API built with Node.js and Express.
- **Data Layer:** Relational data storage using MySQL 8.x.

## 2. Technology Stack
- **Frontend:** React, Vite, React Router DOM, Axios, Vanilla CSS.
- **Backend:** Node.js, Express, `mysql2` (Promise API), `express-validator`, `cors`, `dotenv`.
- **Database:** Local MySQL 8.x.

## 3. Project Structure
```
internship_address_book/
├── backend/
│   ├── src/
│   │   ├── config/db.js           # MySQL connection pool
│   │   ├── controllers/           # Request/Response logic
│   │   ├── middlewares/           # Error handling & Validators
│   │   ├── models/                # Raw SQL queries & Transactions
│   │   ├── routes/                # Express router definitions
│   │   └── index.js               # Express entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/            # Reusable UI components
│   │   ├── pages/                 # View components mapped to routes
│   │   ├── services/              # Axios API service definitions
│   │   ├── App.jsx                # Router setup
│   │   └── styles.css             # Vanilla CSS
│   └── package.json
└── docs/
```

## 4. Database Design & Complete Table Definitions

### `contacts`
```sql
CREATE TABLE `contacts` (
  `id` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `address_line1` varchar(255) DEFAULT NULL,
  `address_line2` varchar(255) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL,
  `postal_code` varchar(20) DEFAULT NULL,
  `company_name` varchar(255) DEFAULT NULL,
  `notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `chk_phone_or_email` CHECK ((`email` is not null) or (`phone` is not null))
);
-- Indexes created on last_name, email, and phone.
```

### `tags`
```sql
CREATE TABLE `tags` (
  `id` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `name` varchar(50) NOT NULL UNIQUE
);
```

### `contact_tags` (Junction Table)
```sql
CREATE TABLE `contact_tags` (
  `contact_id` int NOT NULL,
  `tag_id` int NOT NULL,
  PRIMARY KEY (`contact_id`,`tag_id`),
  FOREIGN KEY (`contact_id`) REFERENCES `contacts` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`tag_id`) REFERENCES `tags` (`id`) ON DELETE CASCADE
);
```

## 5. API Endpoints
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/contacts` | Fetch paginated/searched contacts |
| GET | `/api/contacts/:id` | Fetch single contact |
| POST | `/api/contacts` | Create a new contact (accepts `tagIds` array) |
| PUT | `/api/contacts/:id` | Update a contact and its tags |
| DELETE | `/api/contacts/:id` | Delete a contact |
| GET | `/api/tags` | Fetch all available tags |
| POST | `/api/tags` | Create a new tag |
| DELETE | `/api/tags/:id` | Delete a tag |

## 6. Request/Response Behavior & Validation
- **Input Validation:** Enforced via `express-validator`. `first_name` is mandatory. A custom validator checks that `email` or `phone` is populated. `email` must match a valid RFC email format. `phone` allows flexible numeric/symbol characters.
- **Error Handling:** Centralized Express error middleware. Failed validations return `400 Bad Request` with an array of specific field errors. Database constraints (e.g., CHECK constraints or duplicates) are gracefully caught and mapped to `400` or `409` HTTP codes.

## 7. Search and Pagination
- **Search Engine:** Implemented at the database level using `WHERE ... LIKE '%term%'` spanning the contact fields and the associated tag names.
- **Pagination:** Uses `LIMIT` and `OFFSET` in MySQL queries. The API returns the data payload alongside metadata (`total`, `page`, `limit`, `totalPages`) for the frontend to render navigation controls.

## 8. Security
- SQL injection is fully mitigated as the architecture strictly uses `mysql2` parameterized `?` variables for all user-supplied data. No manual string concatenation is used in query building.

## 9. Setup Instructions
Refer to the `README.md` at the project root for comprehensive installation, environment, and startup instructions.
