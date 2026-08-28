# Internship Address Book

## 1. Project Overview
The Internship Address Book is a full-stack web application designed for comprehensive contact management. The project serves as an internship assignment, aiming to bridge a simplified React frontend with a complex, highly normalized MySQL relational database. The core feature of the application is a backend compatibility layer that automatically translates flat UI data models into robust, atomic, and normalized relational datasets.

## 2. Architecture
The application follows a standard three-tier architecture:
- **Presentation Layer:** A responsive single-page React application providing flat contact creation and editing interfaces.
- **Application Layer:** A Node.js/Express REST API that acts as a translation layer. It orchestrates complex SQL transactions, handles unique constraints, and maps incoming flat data arrays into distinct relational tables.
- **Data Layer:** A highly normalized MySQL database (`temp`) designed for production-grade entity relationships.

## 3. Technology Stack
- **Frontend:** React.js, Vite, Axios
- **Backend:** Node.js, Express, `mysql2/promise`, `express-validator`
- **Database:** MySQL 8+

## 4. Repository Structure
```
d:\internship_address_book\
├── backend/
│   ├── src/
│   │   ├── config/      # Database connection pools
│   │   ├── controllers/ # HTTP request/response handlers
│   │   ├── middlewares/ # Express validators and error boundaries
│   │   ├── models/      # Complex SQL execution and translation logic
│   │   ├── routes/      # Express router definitions
│   │   └── index.js     # Express server entry point
│   ├── tests/           # Integration and E2E API tests
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Route-level components
│   │   ├── services/    # Axios API client
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── docs/                # Project reports and documentation
└── README.md
```

## 5. Frontend Setup
1. Navigate to the frontend directory: `cd frontend`
2. Install dependencies: `npm install`
3. Run the development server: `npm run dev` (Runs on `http://localhost:5173`)
4. Build for production: `npm run build`

## 6. Backend Setup
1. Navigate to the backend directory: `cd backend`
2. Install dependencies: `npm install`
3. Copy the environment template: `cp .env.example .env`
4. Configure your `.env` variables.
5. Start the server: `npm start` (Runs on `http://localhost:5000`)

## 7. Environment Configuration
The backend requires a `.env` file containing:
```
PORT=5000
DB_HOST=your-db-host
DB_USER=temp_rw
DB_PASSWORD=your-db-password
DB_NAME=temp
```

## 8. MySQL Configuration
The database user (`temp_rw`) intentionally operates with restricted privileges to simulate a strict production environment:
- **Granted:** `SELECT`, `INSERT`, `UPDATE`
- **Denied:** `DELETE`

## 9. Normalized Database Architecture
The database is heavily normalized to prevent data duplication. The core entity (`contacts`) relies on several child tables:
- `contact_emails` (1-to-Many)
- `contact_phones` (1-to-Many)
- `contact_addresses` (1-to-Many)
- `organizations` (Many-to-1)
- `contact_category_map` (Many-to-Many, links contacts to `categories`)

## 10. Flat Frontend → Normalized Database Translation
The React UI sends and receives a flat JSON structure (e.g., `email: "test@test.com", phone: "1234567890"`). 
The backend explicitly translates this:
- **On Read (`GET`)**: Multiple SQL queries pull data from `contacts`, `contact_emails`, `contact_phones`, etc., and flatten them into a single object for the frontend.
- **On Write (`POST`/`PUT`)**: The backend initiates an atomic transaction, writes the core record to `contacts`, and cascades insertions to the respective child tables.

## 11. API Endpoints
- `GET /api/contacts` - Fetch all contacts (supports `page`, `limit`, `search`).
- `GET /api/contacts/:id` - Fetch a specific contact by ID.
- `POST /api/contacts` - Create a new contact.
- `PUT /api/contacts/:id` - Perform a partial or full update on an existing contact.
- `DELETE /api/contacts/:id` - Soft-delete a contact.
- `GET /api/tags` - Fetch active categories.
- `POST /api/tags` - Create a new category.
- `DELETE /api/tags/:id` - Soft-delete a category.
- `POST /api/agent/scan` - Scan for duplicate contacts and create proposals.
- `GET /api/agent/proposals` - Fetch all active merge proposals waiting for approval.
- `GET /api/agent/proposals/:id` - Fetch a specific merge proposal.
- `POST /api/agent/proposals/:id/approve` - Approve a merge proposal (updates primary and soft-deletes duplicate).
- `POST /api/agent/proposals/:id/reject` - Reject a merge proposal safely.

## 12. Validation Behavior
- `express-validator` strictly enforces requirements before database execution.
- `first_name` is required on creation.
- `PUT` requests allow omitted fields for genuine partial updates.
- Duplicate emails or phones throw a caught `ER_DUP_ENTRY` constraint, resulting in a safe `409 Conflict` response to the user.

## 13. Search and Pagination Behavior
- **Search:** The backend utilizes `LIKE` and `EXISTS` subqueries to natively search across all normalized child tables (emails, phones, organizations, tags) without generating duplicate Cartesian-product rows.
- **Pagination:** Uses `LIMIT` and `OFFSET` calculated against a discrete `COUNT(DISTINCT c.id)` query to maintain consistent page sizes.

## 14. Transactions
All `POST` and `PUT` contact operations utilize strict atomic transactions (`BEGIN`, `COMMIT`, `ROLLBACK`). If any child-table insertion fails (e.g., due to a constraint or permission error), the entire contact creation or update is cleanly rolled back, ensuring zero orphaned rows.

## 15. Soft Deletion
Due to historical auditing requirements and referential integrity constraints, contacts and categories are NEVER physically removed.
- `DELETE /api/contacts/:id` executes `UPDATE contacts SET is_active = 0, deleted_at = CURRENT_TIMESTAMP`.
- `DELETE /api/tags/:id` executes `UPDATE categories SET is_active = 0`.
Soft-deleted records are automatically excluded from standard `GET` queries.

## 16. Error Handling
The backend catches raw database errors and translates them into RESTful HTTP status codes:
- `400 Bad Request` - Validation failures or explicit check constraints (`ER_CHECK_CONSTRAINT_VIOLATED`).
- `403 Forbidden` - Operation blocked by the DBA (`ER_TABLEACCESS_DENIED_ERROR`).
- `404 Not Found` - Resource does not exist or is soft-deleted.
- `409 Conflict` - Unique constraint violation (`ER_DUP_ENTRY`).
- `500 Internal Server Error` - Unexpected application crashes.

## 17. Testing Instructions
Integration tests are located in `backend/tests/`. Ensure the backend server is running, then execute:
```bash
node backend/tests/test-final.js
```

## 18. E2E Testing Instructions
Run the frontend and backend locally, then open the browser at `http://localhost:5173`. Perform manual UI tests, confirming that creation, edits, searching, and deleting functions behave as expected, and that intentional permission errors trigger the red error banner natively.

## 19. Database Permission Model
The application operates entirely on `SELECT`, `INSERT`, and `UPDATE` privileges. 

## 20. NO-DELETE Limitation
Because the `temp_rw` user does not possess `DELETE` privileges, the application is structurally prevented from removing child records.
**This intentionally blocks the following operations:**
1. Clearing/removing an existing primary email row.
2. Clearing/removing an existing primary phone row.
3. Synchronizing/removing assigned category mappings from a contact (which requires deleting old `contact_category_map` rows).

These operations are **not bugs**. They are explicit security enforcement events. When a user attempts these actions, the transaction rolls back safely, and the API returns a `403 Forbidden`. The frontend successfully renders this as an access denied error.

## 21. Which Operations are PASS
- Contact List Loading
- Search Functionality
- Creating Contacts (with or without tags)
- Partial Updating Contacts
- Soft-Deleting Contacts
- Creating and Soft-Deleting Categories/Tags
- Rejecting Duplicate Emails/Phones (`409 Conflict`)

## 22. Which Operations are BLOCKED
- **Clearing an email/phone field via UI** (`403 Forbidden`)
- **Modifying the selected tags on an existing contact** (`403 Forbidden`)

## 23. Security Considerations
- No SQL queries are dynamically concatenated; all queries utilize parameterized inputs (`?`) via `mysql2` to prevent SQL Injection.
- Internal database schema details, stack traces, and usernames are completely obfuscated from API responses.

## 24. Production/Internship Readiness
The application is fully ready for internship submission. The backend successfully normalizes the flat UI structures, seamlessly handles database constraints, and elegantly traps the intentional DBA privilege limitations to maintain UI stability.

## 25. Address Book Agent (Human-in-the-Loop)
The application includes an integrated **Address Book Agent** designed to safely clean up duplicate contacts through a strict Human-in-the-Loop workflow.

### Agent Workflow
- **Detect & Analyze**: The backend proactively scans all active contacts, comparing emails, phones, names, and organizations to calculate a confidence score.
- **Propose**: High-confidence matches generate a "Merge Proposal", identifying the primary contact and backfilling missing fields from the duplicate.
- **Wait for Approval**: Crucially, the agent **STOPS** and parks the proposal in a `WAITING_FOR_APPROVAL` state inside an in-memory queue. No database modifications occur automatically.
- **Human Review**: Through the `/agent` dashboard, a user reviews the side-by-side comparison and the Agent's specific reasons for flagging the duplicate.
- **Execute Merge**: Only upon explicit human approval does the backend execute an atomic transaction to update the primary contact and soft-delete the duplicate, strictly respecting all `temp_rw` database permissions.
