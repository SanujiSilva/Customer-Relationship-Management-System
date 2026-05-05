# CRM System Lead Management

A full-stack MERN CRM for a small sales team. It includes JWT authentication, lead CRUD, lead notes, dashboard metrics, search, filtering, and persistent MongoDB storage.

## Tech Stack

- Frontend: React, Vite, plain CSS
- Backend: Node.js, Express
- Database: MongoDB with Mongoose
- Authentication: JWT with bcrypt password hashing

## Features

- Protected CRM routes with login
- Test admin user seeded automatically
- Dashboard cards for lead counts and deal values
- Lead creation, viewing, editing, status updates, and deletion
- Lead detail page with timeline notes
- Filters by status, source, and assigned salesperson
- Search by lead name, company, or email
- Practical sales fields such as source, owner, status, value, and timestamps

## Test Login

- Email: `admin@example.com`
- Password: `password123`

## Local Setup

1. Install dependencies:

```bash
npm run install:all
```

2. Create a backend environment file at `server/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/torchlabs_crm
JWT_SECRET=replace-with-a-long-random-secret
CLIENT_URL=http://localhost:5173
```

3. Start MongoDB locally, or replace `MONGODB_URI` with a MongoDB Atlas connection string.

4. Run the full app:

```bash
npm run dev
```

5. Open the frontend:

```text
http://localhost:5173
```

The API runs on:

```text
http://localhost:5000/api
```

## Database Setup

The app uses MongoDB. No manual migrations are required because Mongoose creates collections when records are inserted.

On first server start, the backend seeds:

- Admin user: `admin@example.com`
- Sample leads and notes when the database has no leads

## Environment Variables

Backend variables in `server/.env`:

- `PORT`: backend port, default `5000`
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: secret used to sign JWT tokens
- `CLIENT_URL`: frontend origin for CORS

Frontend variables are optional. By default the frontend calls `http://localhost:5000/api`. To override it, create `client/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

## Known Limitations

- Authentication is intentionally simple for the assessment and has one seeded test user.
- There are no role permissions beyond being logged in.
- Notes can be added but not edited or deleted.
- No automated test suite is included yet.

## Reflection

This project focuses on the core CRM workflows a sales team needs every day: seeing pipeline health, finding leads quickly, updating statuses, and recording context after follow-ups. I chose a simple MERN structure so the frontend, backend, database models, and API flow are easy to explain in a demo. With more time, I would add role-based access, activity reminders, import/export, optimistic UI updates, and richer reporting by salesperson and source.

## Demo Video Guide

For the 5 to 10 minute video, show:

1. Installing dependencies and running the app.
2. Logging in with the test user.
3. Reviewing dashboard metrics.
4. Creating a lead.
5. Editing the lead and changing status.
6. Adding a note on the lead detail page.
7. Searching and filtering leads.
8. Briefly explaining the Express routes, Mongoose models, and MongoDB persistence.
