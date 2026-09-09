# Collaborative Development and Cloud Deployment

A CS 440 team assignment for practicing collaborative full-stack development and cloud deployment. The project starts with a simple message-submission application, which team members extend through feature branches, pull requests, code review, and database migrations.

## How the application works

The React frontend, built with Vite and hosted on Vercel, collects user input and sends JSON requests to a Node.js/Express backend hosted on Railway. The backend writes records to a MySQL database on Railway and returns a success or error response to the page.

The original form accepts a name and message and sends them to `POST /api/messages`. The baseline `messages` table contains an automatically generated `id`, a `name`, and a `message`. Individual features build on this foundation by adding inputs and buttons, a column to the shared table, and a separate related table.

| Location | Purpose |
| --- | --- |
| `frontend/` | React page, components, styles, and Vite configuration |
| `backend/` | Express API and database access |
| `backend/schema.sql` | Initial definition of the shared `messages` table |
| `backend/migrations/` | Database changes introduced by team features |

## Local database setup

Use a separate local MySQL database for development. In MySQL Workbench, connect to the local server and execute:

```sql
CREATE DATABASE IF NOT EXISTS cs440_collab;
USE cs440_collab;
```

Execute `backend/schema.sql` first, then the migrations required by the features in your checked-out branch. Follow each feature's documented migration order. In Workbench, select the intended database before opening and executing each SQL file; keep environment-specific database names out of the migration files.

Apply each migration once per database and record which files have been applied. The SQL files are executed manually: saving, committing, or deploying them does not run them automatically. Inspect existing column and table definitions before rerunning a migration.

## Environment configuration and local startup

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

## Testing and collaboration

Test each feature locally by submitting its form and checking the resulting database records. Confirm that existing message and teammate workflows still work. From `frontend`, run `npm run lint` and `npm run build` before requesting review.

Work on a feature branch, commit and push your changes, and open a pull request with a description of the feature, its migrations, and completed tests. Incorporate the latest `main`, resolve conflicts while preserving teammates' work, and obtain review before merging.

## Deployment

The team deploys the frontend to Vercel and the backend and MySQL database to Railway. Apply any pending migrations to the intended Railway database before deploying code that depends on them; changes to a local database do not propagate to Railway.

Set the backend's `MYSQL_URL` through Railway's environment settings and the frontend's `VITE_API_URL` to the Railway backend base URL, without a trailing slash. Rebuild and redeploy the frontend when its code or build-time environment changes. Coordinate migrations with any automatic deployments triggered by merging.

After deployment, submit through the live application and verify the resulting database records. Also check that existing workflows still function.

## Message with Feedback feature

Adds a separate form for a name, message, topic, and feedback note. `POST /api/apurb-feedback` validates the input and saves linked rows in `messages` and `apurb_feedback` in one transaction, preserving the original form. Its migrations add nullable `messages.apurb_topic` and create `apurb_feedback`; apply `20260908_1300_apurb_add_topic.sql` before `20260908_1310_apurb_create_feedback.sql` from `backend/migrations/`.

## Taha's Categorized Message feature

The Taha feature is implemented by `POST /api/taha-messages`. Its transaction
writes the submitted name, message, and category to both `messages` and
`taha_messages`, so either both rows are committed or neither row is saved.

Migrations: `backend/migrations/202609081200_add_taha_category_to_messages.sql`
adds the nullable `messages.taha_category` column, and
`backend/migrations/202609081210_create_taha_messages.sql` creates the
`taha_messages` table. Apply both once to the target database.
