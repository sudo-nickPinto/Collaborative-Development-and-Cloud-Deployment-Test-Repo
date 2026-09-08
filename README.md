# Collaborative Development and Cloud Deployment

## Local setup

1. Run `backend/schema.sql` against a local MySQL database.
2. Run the SQL files in `backend/migrations` in filename order.
3. Copy `backend/.env.example` to `backend/.env` and set `MYSQL_URL`.
4. Copy `frontend/.env.example` to `frontend/.env.local` and set `VITE_API_URL`.
5. In separate terminals, run `npm install` and `npm start` in `backend`, then
   run `npm install` and `npm run dev` in `frontend`.

The Taha feature is implemented by `POST /api/taha-messages`. Its transaction
writes the submitted name, message, and category to both `messages` and
`taha_messages`, so either both rows are committed or neither row is saved.
