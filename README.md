# Klyp

Klyp is my lightweight way to keep copied content available on any device as long as I am logged in. It is not a Google Drive clone, just a simple, fast place to save and pull snippets when I need them.

## What it does

- Syncs your copied content across devices once you are signed in
- Quick login and signup flow
- Inbox style list for your saved items
- Basic account settings
- Simple API-backed storage

## Tech stack

- Frontend: Vite + React + TypeScript (in `build`)
- Backend: Node.js + TypeScript (in `server`)
- Database: PostgreSQL

## Local setup

### 1) Database

1. Create a Postgres database named `klip`
2. Run the schema in [server/src/db/schema.sql](server/src/db/schema.sql)

### 2) Backend

```bash
cd server
npm install
```

Create `server/.env` and set your Postgres URL:

```env
DATABASE_URL=postgres://[USERNAME]:[PASSWORD]@localhost:5432/klip
```

Start the API server:

```bash
npm run dev
```

### 3) Frontend

```bash
cd build
npm install
npm run dev
```

Open the Vite URL in your terminal output, usually `http://localhost:5173`.

## Project structure

```
build/   # Frontend app
server/  # API server
```

## Notes

- If you change the database name or port, update `DATABASE_URL` accordingly.
- This is meant to stay lightweight, fast, and easy to use.
