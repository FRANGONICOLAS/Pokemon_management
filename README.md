# Pokemon Management

Technical test project for favorite pokemon management with authentication.

## Monorepo Structure

- frontend: React + TypeScript client app
- backend: NestJS + TypeScript API

## General Requirements

- Node.js 20+
- npm 10+
- PostgreSQL 14+

## Tech Stack

### Frontend

- React 19 + TypeScript
- React Router
- Axios
- Vite

### Backend

- Framework: NestJS with TypeScript
- ORM: TypeORM
- Database: PostgreSQL
- Authentication: JWT
- Validation: class-validator

## Setup

1. Install frontend dependencies:

```bash
cd frontend
npm install
```

2. Install backend dependencies:

```bash
cd ../backend
npm install
```

3. Create frontend environment file:

```bash
cd ../frontend
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

4. Create backend environment file:

```bash
cd ../backend
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

5. Update backend .env with your local PostgreSQL credentials.

## Environment Variables

### Frontend

- VITE_API_BASE_URL: API base URL.

Recommended for local development:

- VITE_API_BASE_URL=/api

The Vite proxy maps /api/* to http://localhost:3000/*.

### Backend

```env
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=pokemon_management

JWT_SECRET=change_this_secret_in_production
```

## Run The Project

### Backend

```bash
cd backend
npm run start:dev
```

### Frontend

```bash
cd frontend
npm run dev
```

## Scripts

### Backend

- npm run start
- npm run start:dev
- npm run build
- npm run lint
- npm run test
- npm run test:e2e

### Frontend

- npm run dev
- npm run build
- npm run lint

## Frontend Pages

- /auth: login and registration
- /dashboard: list, search, filter, pagination and delete
- /pokemon/new: add favorite pokemon
- /pokemon/:id: favorite detail
- /pokemon/:id/edit: edit notes/comments

## UI Screenshots

Add your UI captures in this section to show the main user flows.

### Auth Page

![Auth Page](./docs/screenshots/auth-page.png)

### Dashboard

![Dashboard](./docs/screenshots/dashboard-page.png)

### Add Favorite Pokemon

![Add Favorite Pokemon](./docs/screenshots/add-favorite-page.png)

### Pokemon Detail

![Pokemon Detail](./docs/screenshots/pokemon-detail-page.png)

### Edit Favorite Pokemon

![Edit Favorite Pokemon](./docs/screenshots/edit-favorite-page.png)

## Main Backend Endpoints

- POST /auth/register
- POST /auth/login
- GET /users
- POST /pokemon
- GET /pokemon
- GET /pokemon/:id
- PUT /pokemon/:id
- DELETE /pokemon/:id

Note: all /pokemon endpoints require Authorization: Bearer <token>.

## API Usage Examples

Base URL:

- http://localhost:3000

Important notes:

- The register endpoint requires name, email, and password.
- The login response returns token (not access_token).
- There is no /pokemon/catalog endpoint in this backend.
- Favorite operations use UUID identifiers in /pokemon/:id.

### 1. Register user

What it does:

- Creates a new user account.

```bash
curl -X POST http://localhost:3000/auth/register \
	-H "Content-Type: application/json" \
	-d '{"name":"Test User","email":"user@test.com","password":"Abcdef1!"}'
```

Expected response (201):

```json
{
	"message": "User created successfully"
}
```

Common errors:

- 400 when email already exists
- 400 when validation fails (missing fields or invalid password format)

### 2. Login

What it does:

- Validates credentials and returns a JWT token for protected endpoints.

```bash
curl -X POST http://localhost:3000/auth/login \
	-H "Content-Type: application/json" \
	-d '{"email":"user@test.com","password":"Abcdef1!"}'
```

Expected response (200):

```json
{
	"message": "Login successful",
	"email": "user@test.com",
	"token": "<JWT_TOKEN>"
}
```

Common errors:

- 401 when email does not exist
- 401 when password is invalid

### 3. Create favorite pokemon

What it does:

- Adds a pokemon to the authenticated user's favorites.
- pokemon can be name (for example, pikachu) or PokeAPI numeric id (for example, 25).

```bash
curl -X POST http://localhost:3000/pokemon \
	-H "Content-Type: application/json" \
	-H "Authorization: Bearer <JWT_TOKEN>" \
	-d '{"pokemon":"pikachu","notes":"Electric type","comments":"My favorite"}'
```

Expected response (201):

```json
{
	"id": "<favorite_uuid>",
	"notes": "Electric type",
	"comments": "My favorite",
	"createdAt": "2026-04-06T01:00:00.000Z",
	"pokemon": {
		"id": "<pokemon_uuid>",
		"pokeApiId": 25,
		"name": "pikachu",
		"spriteUrl": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png",
		"types": ["electric"]
	}
}
```

Common errors:

- 401 when token is missing or invalid
- 404 when pokemon does not exist in PokeAPI
- 409 when pokemon is already in favorites for the same user

### 4. List favorites (paginated)

What it does:

- Returns authenticated user's favorites with pagination metadata.

```bash
curl -X GET "http://localhost:3000/pokemon?page=1&limit=20" \
	-H "Authorization: Bearer <JWT_TOKEN>"
```

Expected response (200):

```json
{
	"data": [
		{
			"id": "<favorite_uuid>",
			"notes": "Electric type",
			"comments": "My favorite",
			"createdAt": "2026-04-06T01:00:00.000Z",
			"pokemon": {
				"id": "<pokemon_uuid>",
				"pokeApiId": 25,
				"name": "pikachu",
				"spriteUrl": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png",
				"types": ["electric"]
			}
		}
	],
	"pagination": {
		"page": 1,
		"limit": 20,
		"total": 1,
		"totalPages": 1
	}
}
```

### 5. Get one favorite by id

What it does:

- Returns a specific favorite of the authenticated user.

```bash
curl -X GET http://localhost:3000/pokemon/<FAVORITE_UUID> \
	-H "Authorization: Bearer <JWT_TOKEN>"
```

Expected response (200):

```json
{
	"id": "<favorite_uuid>",
	"notes": "Electric type",
	"comments": "My favorite",
	"createdAt": "2026-04-06T01:00:00.000Z",
	"pokemon": {
		"id": "<pokemon_uuid>",
		"pokeApiId": 25,
		"name": "pikachu",
		"spriteUrl": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png",
		"types": ["electric"]
	}
}
```

Common errors:

- 404 when favorite id does not exist for the authenticated user

### 6. Update favorite

What it does:

- Updates notes and/or comments for one favorite of the authenticated user.

```bash
curl -X PUT http://localhost:3000/pokemon/<FAVORITE_UUID> \
	-H "Content-Type: application/json" \
	-H "Authorization: Bearer <JWT_TOKEN>" \
	-d '{"comments":"Updated comment","notes":"Updated notes"}'
```

Expected response (200):

```json
{
	"id": "<favorite_uuid>",
	"notes": "Updated notes",
	"comments": "Updated comment",
	"createdAt": "2026-04-06T01:00:00.000Z",
	"pokemon": {
		"id": "<pokemon_uuid>",
		"pokeApiId": 25,
		"name": "pikachu",
		"spriteUrl": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png",
		"types": ["electric"]
	}
}
```

Common errors:

- 404 when favorite id does not exist for the authenticated user

### 7. Delete favorite

What it does:

- Removes one favorite pokemon from the authenticated user's list.

```bash
curl -X DELETE http://localhost:3000/pokemon/<FAVORITE_UUID> \
	-H "Authorization: Bearer <JWT_TOKEN>"
```

Expected response (200):

```json
{
	"message": "Favorite pokemon removed successfully",
	"removed": {
		"id": "<favorite_uuid>",
		"notes": "Updated notes",
		"comments": "Updated comment",
		"createdAt": "2026-04-06T01:00:00.000Z",
		"pokemon": {
			"id": "<pokemon_uuid>",
			"pokeApiId": 25,
			"name": "pikachu",
			"spriteUrl": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png",
			"types": ["electric"]
		}
	}
}
```

Common errors:

- 404 when favorite id does not exist for the authenticated user

## Implemented Features

- Auth with persistence in localStorage/sessionStorage
- Protected routes with JWT token
- Full CRUD integration with backend API
- Search by name and filter by type
- Form validation for auth and pokemon forms
- Loading states, API error handling, toast notifications
- Responsive UI (mobile-first)

## Notes

- Backend TypeORM configuration is environment-based in backend/src/app.module.ts.
- synchronize is enabled for development convenience and should be disabled in production.
