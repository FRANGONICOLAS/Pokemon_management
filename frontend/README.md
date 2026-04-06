# Frontend - Pokemon Management

React + TypeScript application for authentication and favorite pokemon management.

## Tech Stack

- React 19 + TypeScript
- React Router
- Axios
- Vite

## Setup

1. Install dependencies:

```bash
npm install
```

2. Configure environment variables:

```bash
cp .env.example .env
```

3. Run development server:

```bash
npm run dev
```

## Environment Variables

- `VITE_API_BASE_URL`: API base URL.

Recommended for local development:

- `VITE_API_BASE_URL=/api` (uses Vite proxy to `http://localhost:3000` and avoids CORS in browser)

## Pages

- `/auth`: login and registration
- `/dashboard`: list, search, filter, pagination and delete
- `/pokemon/new`: add favorite pokemon
- `/pokemon/:id`: favorite detail
- `/pokemon/:id/edit`: edit notes/comments

## Implemented Features

- Auth with persistence in localStorage/sessionStorage
- Protected routes with JWT token
- Full CRUD integration with backend API
- Search by name and filter by type
- Form validation for auth and pokemon forms
- Loading states, API error handling, toast notifications
- Responsive UI (mobile-first)

## Local CORS Note

The Vite config includes a dev proxy:

- `/api/*` -> `http://localhost:3000/*`

If you still see CORS errors, restart the frontend dev server after changing env variables.
