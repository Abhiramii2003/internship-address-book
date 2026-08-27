# Address Book Entity-Relationship Diagram

Below is the Mermaid ER diagram representing the relational database structure for the Address Book application.

```mermaid
erDiagram
    CONTACTS {
        int id PK
        varchar(100) first_name
        varchar(100) last_name
        varchar(255) email
        varchar(50) phone
        varchar(255) address_line1
        varchar(255) address_line2
        varchar(100) city
        varchar(100) state
        varchar(100) country
        varchar(20) postal_code
        varchar(255) company_name
        text notes
        timestamp created_at
        timestamp updated_at
    }
    TAGS {
        int id PK
        varchar(50) name UK
    }
    CONTACT_TAGS {
        int contact_id PK, FK
        int tag_id PK, FK
    }

    CONTACTS ||--o{ CONTACT_TAGS : "has"
    TAGS ||--o{ CONTACT_TAGS : "assigned to"
```

## Relationships
- **Many-to-Many**: The `CONTACTS` table and `TAGS` table share a Many-to-Many relationship.
- **Junction Table**: This relationship is resolved by the `CONTACT_TAGS` junction table, which utilizes a composite primary key consisting of both `contact_id` and `tag_id`.
- **Integrity**: Both foreign keys in `CONTACT_TAGS` implement `ON DELETE CASCADE`. Removing a Contact or a Tag will automatically remove their associations from the junction table.
