# Deployment Readiness Report

## Executive Summary
This application is structurally complete but requires explicit configuration updates before it can be safely hosted on the public internet. The architecture is sound, but deploying it "as-is" will result in a broken frontend (due to localhost hardcoding) and a severe data pollution risk for the shared internship database.

---

## 1. Deployment Blockers

| Component | Issue | Classification | Resolution |
| :--- | :--- | :--- | :--- |
| **Frontend API Configuration** | `frontend/src/services/api.js` hardcodes `http://localhost:5000/api`. This will break when accessed from external devices. | **BLOCKED** | Change `baseURL` to use `import.meta.env.VITE_API_URL || 'http://localhost:5000/api'`. |
| **Database Safety** | The API lacks authentication. If the existing `temp` database is used publicly, anyone on the internet can add or alter records, polluting shared internship data. | **BLOCKED** | Migrate deployment to a **demo-only copy** of the database schema, isolating it from real internship data. |
| **SPA Routing** | The React app uses React Router. On standard static hosts, refreshing a page like `/add` will return a 404 error. | **REQUIRES CONFIGURATION** | Add a `vercel.json` or `_redirects` file to rewrite all traffic to `index.html`. |
| **CORS Policy** | The Express backend uses `app.use(cors())`, accepting requests from any origin. | **WARNING** | Restrict CORS in production using an environment variable (e.g., `process.env.FRONTEND_URL`). |

---

## 2. Recommended Hosting Architecture

For a simple, reliable, and cost-effective internship demonstration:

- **Frontend:** **Vercel**
  - *Why:* Zero-configuration support for Vite, built-in global CDN, and easy SPA redirect handling.
- **Backend:** **Render (Web Service)** or **Railway**
  - *Why:* Natively runs Node.js/Express `npm start` commands and injects `.env` variables securely via a dashboard.
- **Database:** **Dedicated Demo MySQL** (e.g., Aiven or an isolated schema on your current host).
  - *Why:* Prevents public internet users from corrupting your actual internship records.

**Communication Flow:** 
The user visits the Vercel frontend → Axios fires requests to the Render backend URL (configured via `VITE_API_URL`) → Render backend queries the remote MySQL demo database.

---

## 3. Environment Variables

### Frontend (Configured in Vercel Dashboard)
- `VITE_API_URL`: The public URL of your deployed backend (e.g., `https://address-book-api.onrender.com/api`).

### Backend (Configured in Render/Railway Dashboard)
- `PORT`: (Auto-injected by the hosting provider, usually defaults to something dynamic).
- `DB_HOST`: The host URL of the database.
- `DB_USER`: The username (must be restricted to SELECT, INSERT, UPDATE).
- `DB_PASSWORD`: The database password.
- `DB_NAME`: The dedicated demo database name.
- `FRONTEND_URL` (Optional but recommended): The Vercel URL to restrict CORS.

---

## 4. Current Limitations

The `temp_rw` database user intentionally lacks `DELETE` permissions. 
**If you replicate this permission model on the demo database (recommended):**
- Soft deletion of contacts and tags will continue to work perfectly.
- Clearing emails, clearing phones, and altering tag mappings will return a `403 Forbidden` response. 
- The frontend will display this cleanly as a red error banner. **Do NOT grant DELETE privileges unless you explicitly want to demonstrate child-row removal.**

---

## 5. Deployment Sequence

1. **Database:** Export the `temp` database schema (without the private data) and spin up a demo MySQL instance. Create a demo user with `SELECT`, `INSERT`, and `UPDATE` permissions.
2. **Source Code:** Update `api.js` to utilize `import.meta.env.VITE_API_URL`.
3. **Backend:** Connect your GitHub repository to Render/Railway. Input the Database environment variables. Deploy and verify the health/startup logs.
4. **Frontend:** Connect your GitHub repository to Vercel. Set the `VITE_API_URL` environment variable to match the backend. Deploy.

---

## 6. Post-Deployment Tests
Once live, navigate to the public Vercel URL and verify:
1. The contact list loads (Backend & DB connection successful).
2. You can create a new contact (INSERT permissions successful).
3. Attempting to clear an email results in a visible `403 Forbidden` banner (DELETE restrictions correctly enforced).

---

## Final Verdict
**DEPLOYMENT READY AFTER CONFIGURATION** 

The application code is robust and structurally complete, but it requires environmental decoupling (removing localhost) and database isolation before it can safely face the public web.
