# Collaborative-Development-and-Cloud-Deployment-Test-Repo

## Message with Feedback feature

The main page includes a separate **Message with Feedback** form alongside the original message form. Clicking **Save Feedback** sends a name, message, topic, and feedback note to the backend. The backend inserts a message and its related feedback row in one transaction.

| Input | Maximum length | Database destination |
| --- | --- | --- |
| Name | 100 characters | `messages.name` |
| Message | 255 characters | `messages.message` |
| Topic | 100 characters | `messages.apurb_topic` |
| Feedback note | 255 characters | `apurb_feedback.note` |

All four inputs must be nonblank strings. The backend trims surrounding whitespace and checks length limits. The new `apurb_topic` column allows `NULL` so the original message endpoint can continue inserting without a topic.

### Implementation

- `frontend/src/ApurbFeedback.jsx`: form, input state, request, and success/error feedback.
- `frontend/src/App.jsx`: displays the new component on the main page.
- `backend/apurb-feedback.js`: validates input and inserts both records using a connection reserved from a MySQL pool.
- `backend/server.js`: registers the new route after JSON parsing and environment configuration.
- `backend/migrations/`: SQL files that extend the baseline database schema.

The backend uses parameterized SQL. It inserts into `messages` first, then uses that row's generated ID as `apurb_feedback.message_id`. A foreign key links the two tables. Both inserts commit together; an insert failure triggers rollback. Both tables must use InnoDB for the intended transaction behavior.

### API

`POST /api/apurb-feedback`

Send `Content-Type: application/json` with this request structure:

```json
{
  "name": "Example Student",
  "message": "APURB-LOCAL-TEST-001",
  "topic": "Coursework",
  "note": "Checking that both rows are saved"
}
```

A successful response has status `201` and contains `messageId` and `feedbackId`, the generated IDs of the two records. Invalid input returns `400`; a database or server failure returns `500` with a generic error message. Detailed database errors are logged by the backend.

### Database setup and migration order

Use a separate local MySQL database for development. In MySQL Workbench, connect to the local server and execute:

```sql
CREATE DATABASE IF NOT EXISTS cs440_collab;
USE cs440_collab;
```

For a fresh database, execute `backend/schema.sql` first to create the original `messages` table. Then apply these migrations in order:

1. `backend/migrations/20260908_1300_apurb_add_topic.sql` — adds nullable `messages.apurb_topic`.
2. `backend/migrations/20260908_1310_apurb_create_feedback.sql` — creates `apurb_feedback` with `id`, `message_id`, and `note`.

To apply a file in Workbench, select the intended database, open the SQL file, and execute its statements. For local testing, run `USE cs440_collab;` in the same query tab before the migration. Keep that local database name out of the migration files so they can also be used in environments with another database name.

**Apply each migration once per database.** These are manually executed SQL files; there is no migration runner or applied-migration history table. Saving, committing, or deploying the files does not execute them. Record which migrations have been applied. If a column or table already exists, inspect its definition before deciding whether the corresponding migration is already complete.

Verify the resulting schema:

```sql
USE cs440_collab;
DESCRIBE messages;
DESCRIBE apurb_feedback;
SHOW CREATE TABLE messages;
SHOW CREATE TABLE apurb_feedback;
```

### Environment configuration and local startup

Create `backend/.env` with local connection settings, replacing the placeholders:

```dotenv
MYSQL_URL=mysql://YOUR_USER:YOUR_URL_ENCODED_PASSWORD@127.0.0.1:3306/cs440_collab
PORT=3000
```

URL-encode special characters in the password when placing it in the connection URL; for example, `$` becomes `%24`. This changes the URL representation, not the actual MySQL password.

Create `frontend/.env.local` with:

```dotenv
VITE_API_URL=http://localhost:3000
```

Keep credentials in the backend environment only. The existing ignore files exclude `backend/.env` and the frontend's `.env.local`. Do not commit actual credentials. The frontend API URL is public configuration.

In one terminal, starting from the repository root:

```powershell
cd backend
npm ci
node server.js
```

`npm start` runs the same backend entry point when npm is working. In a second terminal, starting from the repository root:

```powershell
cd frontend
npm ci
npm run dev
```

Dependency installation is only needed when dependencies are missing or the lockfile changes. Keep both servers running and open the frontend URL printed by Vite. Restart the backend after editing its code or `.env`; restart Vite after changing its environment file.

### Verification procedure

1. Submit the example values above through **Message with Feedback**. Expect **Saved to both tables!** and cleared inputs.
2. Verify the related records using the query below. Use a new distinctive message for each test run if the example has already been submitted.
3. Submit through the original form. Confirm it still inserts into `messages` without requiring a topic or feedback row.
4. Try empty fields and whitespace-only input. Confirm rejection and no new records for rejected requests.
5. In an isolated local test, temporarily point the second INSERT at a nonexistent table, restart the backend, and submit a unique message. Confirm an error and no matching row in `messages`, demonstrating rollback. Restore the correct table name, restart, and retest before committing.
6. From `frontend`, run `npm run lint` and `npm run build`.

```sql
SELECT
    m.id AS message_id,
    m.name,
    m.message,
    m.apurb_topic,
    f.id AS feedback_id,
    f.note
FROM messages AS m
JOIN apurb_feedback AS f
    ON f.message_id = m.id
WHERE m.message = 'APURB-LOCAL-TEST-001';
```

#### Recorded verification status

During local troubleshooting on September 9, 2026, the backend started successfully, logged `Connected to MySQL`, and returned HTTP `200` with `Backend is running` from `GET /`. These checks confirm startup and basic connectivity, not successful two-table insertion.

The following results have not yet been recorded in this README:

- [ ] Successful form submission verified by the joined database query.
- [ ] Original form regression test.
- [ ] Invalid-input rejection with no inserted records.
- [ ] Rollback test.
- [ ] Frontend lint and production build.
- [ ] Deployed end-to-end test with database verification.

Update this checklist only after completing the corresponding checks.

### Deployment

Coordinate with the team member managing Railway and Vercel. Apply both migrations once to the intended Railway MySQL database before deploying code that uses them. Confirm whether they have already been applied; local database changes do not propagate to Railway.

Configure the backend's `MYSQL_URL` through Railway's environment settings. Keep Vercel's `VITE_API_URL` pointed at the Railway backend base URL, without a trailing slash, and rebuild/redeploy the frontend when its code or build-time environment changes. No new base URL is needed for this endpoint.

After deployment, submit a uniquely named cloud test message and run the joined query against Railway to verify both records. Also check that the original form still works. Coordinate migration timing with any automatic deployments triggered by merging.
