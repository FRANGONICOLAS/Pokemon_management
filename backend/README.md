# Backend - Pokemon Management

Backend API for authentication and favorite pokemon management.

## Stack

- Framework: NestJS with TypeScript
- ORM: TypeORM
- Database: PostgreSQL
- Authentication: JWT
- Validation: class-validator

## Requirements

- Node.js 20+
- PostgreSQL 14+

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create environment file:

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

3. Update values in .env according to your local PostgreSQL instance.

## Environment Variables

The backend reads database and auth configuration from .env.

```env
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=pokemon_management

JWT_SECRET=change_this_secret_in_production
```

## Run

```bash
# development (watch)
npm run start:dev

# production build
npm run build
npm run start:prod
```

## Available Scripts

- npm run start
- npm run start:dev
- npm run build
- npm run lint
- npm run test
- npm run test:e2e

## Main Endpoints

- POST /auth/register
- POST /auth/login
- GET /users
- POST /pokemon
- GET /pokemon
- GET /pokemon/:id
- PUT /pokemon/:id
- DELETE /pokemon/:id

Note: all /pokemon endpoints require Authorization: Bearer <token>.

## Notes

- TypeORM is configured in [src/app.module.ts](src/app.module.ts) using environment variables.
- synchronize is currently enabled for development convenience and should be disabled in production.
