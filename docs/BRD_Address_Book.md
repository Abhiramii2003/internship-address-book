# Business Requirements Document (BRD)
**Project Name:** Address Book Management Application

## 1. Executive Summary
The Address Book Management Application is a full-stack web application designed to help users efficiently manage their contacts, which can include both individuals and organizations. The system prioritizes ease of use, data integrity, and fast search capabilities, ensuring users can securely store, organize, and retrieve contact information on demand.

## 2. Objectives
- Provide a robust digital ledger for managing personal and professional contacts.
- Allow rich data capture including names, multiple contact methods, physical addresses, and organization details.
- Empower users to categorize contacts flexibly using custom tags.
- Deliver a fast, responsive user interface accessible across desktop and mobile devices.

## 3. Scope
The scope of this project encompasses the development of a relational database schema, a backend RESTful API, and a frontend web interface. The system operates locally and does not integrate with external cloud databases or third-party authentication services.

## 4. Functional Requirements
- **Contact Management:** Users can Create, Read, Update, and Delete (CRUD) contacts.
- **Mandatory Fields:** A contact MUST have a `first_name` and MUST have at least one valid method of contact (either `email` or `phone`).
- **Tagging System:** Contacts can be assigned zero or more custom tags (e.g., "VIP", "Family", "Colleague"). Users can create tags dynamically.
- **Search:** Users can perform a unified text search across `first_name`, `last_name`, `email`, `phone`, and associated tag names.
- **Pagination:** The contact list displays a maximum of 20 records per page to optimize performance.
- **Cascading Deletions:** Deleting a contact or a tag will automatically remove associated relationships without leaving orphaned records.

## 5. Non-functional Requirements
- **Performance:** Database queries and searches must be optimized using appropriate indexes.
- **Responsiveness:** The frontend UI must adapt to different screen sizes.
- **Reliability:** Data modifications (like saving a contact with tags) must be wrapped in transactions to prevent partial updates.
- **Security:** SQL injection must be prevented via parameterized queries. API endpoints must validate all input.

## 6. Stakeholders
- **End Users:** Individuals using the application to store address data.
- **Development Team:** Full-stack developers responsible for architecture, coding, and maintenance.

## 7. Constraints
- The backend must not use an ORM (e.g., Sequelize or Prisma); standard raw parameterized SQL queries (`mysql2`) must be used.
- The system must use a local MySQL 8.x database.

## 8. Assumptions
- The database is deployed locally on the host machine running the Node.js application.
- Users have modern web browsers capable of rendering React/Vite applications.

## 9. User Workflows
- **Add Contact Workflow:** User clicks "Add Contact", fills out required details, creates or selects tags, and submits. The system validates the input and redirects to the home page on success.
- **Search Workflow:** User types a term into the search bar; the system dynamically fetches and displays matching contacts, updating the pagination controls accordingly.
- **Delete Workflow:** User selects "Delete" on a contact card. A confirmation modal appears. Upon confirmation, the contact is permanently erased from the system.
