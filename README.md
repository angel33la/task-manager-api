# Task Manager API + Vite Frontend

This project runs a React frontend with Vite and a standalone Express + Mongoose API.

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Start development (frontend + API):

```bash
npm run dev
```

3. Open the app:

- Frontend: http://localhost:5173
- API: http://localhost:4000/api

If ports are busy, clean old dev processes first:

```bash
npm run stop:dev
```

## Production-style Run

Build and serve static frontend from Express:

```bash
npm run start:full
```

Then open http://localhost:4000.

## Environment Variables

Use a single env source at project root: `.env`.

Create it from the template:

```bash
cp .env.example .env
```

Required keys:

- `MONGO_URI`
- `PORT` (optional; defaults to `4000`)

## Smoke Checks

Run basic API smoke checks:

```bash
npm run test:smoke
```

## CI

GitHub Actions workflow at `.github/workflows/ci.yml` runs:

- API smoke checks
- Lighthouse report generation (uploaded as workflow artifacts)

## Security: Credential Rotation

To rotate MongoDB credentials safely:

1. Create a new DB user/password in MongoDB Atlas.
2. Update `.env` with the new `MONGO_URI`.
3. Revoke the old DB user/password in Atlas.

Do not commit `.env` to source control.
