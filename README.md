# Pokemon Management

Proyecto de prueba tecnica para gestionar pokemon favoritos con autenticacion.

## Resumen del proyecto

- Estructura: monorepo con frontend y backend
- Frontend: React 19 + TypeScript, React Router, Axios, Vite
- Backend: NestJS + TypeScript, TypeORM, PostgreSQL, JWT, class-validator

## Requisitos generales

- Node.js 20+
- npm 10+
- PostgreSQL 14+

## 1. Instrucciones de instalacion y ejecucion

### 1.1 Instalar dependencias

Frontend:

```bash
cd frontend
npm install
```

Backend:

```bash
cd ../backend
npm install
```

### 1.2 Crear archivos de entorno

Frontend:

```bash
cd ../frontend
cp .env.example .env
```

Backend:

```bash
cd ../backend
cp .env.example .env
```

En Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

### 1.3 Ejecutar el proyecto

Backend (API):

```bash
cd backend
npm run start:dev
```

Frontend (UI):

```bash
cd frontend
npm run dev
```

### 1.4 Scripts utiles

Backend:

- npm run start
- npm run start:dev
- npm run build
- npm run lint
- npm run test
- npm run test:e2e

Frontend:

- npm run dev
- npm run build
- npm run lint

## 2. Variables de entorno necesarias

### 2.1 Frontend

- VITE_API_BASE_URL: URL base de la API.

Valor recomendado en desarrollo local:

- VITE_API_BASE_URL=/api

Nota: Vite usa proxy para mapear /api/* hacia http://localhost:3000/*.

### 2.2 Backend

```env
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=pokemon_management

JWT_SECRET=change_this_secret_in_production
```

## 3. Ejemplos de uso de la API

Base URL:

- http://localhost:3000

Notas importantes:

- El registro requiere name, email y password.
- El login responde token (no access_token).
- No existe endpoint /pokemon/catalog en este backend.
- Las operaciones de favoritos usan UUID en /pokemon/:id.

### 3.1 Registro de usuario

Que hace:

- Crea una cuenta nueva.

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"user@test.com","password":"Abcdef1!"}'
```

Respuesta esperada (201):

```json
{
  "message": "User created successfully"
}
```

Errores comunes:

- 400 si el email ya existe
- 400 si falla la validacion del DTO

### 3.2 Login

Que hace:

- Valida credenciales y retorna un JWT para endpoints protegidos.

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"Abcdef1!"}'
```

Respuesta esperada (200):

```json
{
  "message": "Login successful",
  "email": "user@test.com",
  "token": "<JWT_TOKEN>"
}
```

Errores comunes:

- 401 si el email no existe
- 401 si la contrasena es incorrecta

### 3.3 Crear favorito

Que hace:

- Agrega un pokemon a favoritos del usuario autenticado.
- pokemon puede ser nombre (por ejemplo pikachu) o id numerico de PokeAPI (por ejemplo 25).

```bash
curl -X POST http://localhost:3000/pokemon \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -d '{"pokemon":"pikachu","notes":"Electric type","comments":"My favorite"}'
```

Respuesta esperada (201):

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

Errores comunes:

- 401 si el token falta o es invalido
- 404 si el pokemon no existe en PokeAPI
- 409 si ese pokemon ya esta en favoritos para ese usuario

### 3.4 Listar favoritos (paginado)

Que hace:

- Retorna los favoritos del usuario autenticado con metadatos de paginacion.

```bash
curl -X GET "http://localhost:3000/pokemon?page=1&limit=20" \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

Respuesta esperada (200):

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

### 3.5 Obtener detalle de un favorito

Que hace:

- Retorna un favorito especifico del usuario autenticado.

```bash
curl -X GET http://localhost:3000/pokemon/<FAVORITE_UUID> \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

Respuesta esperada (200):

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

Errores comunes:

- 404 si el favorito no pertenece al usuario autenticado o no existe

### 3.6 Actualizar favorito

Que hace:

- Actualiza notes y/o comments de un favorito.

```bash
curl -X PUT http://localhost:3000/pokemon/<FAVORITE_UUID> \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -d '{"comments":"Updated comment","notes":"Updated notes"}'
```

Respuesta esperada (200):

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

Errores comunes:

- 404 si el favorito no pertenece al usuario autenticado o no existe

### 3.7 Eliminar favorito

Que hace:

- Elimina un pokemon de la lista de favoritos del usuario autenticado.

```bash
curl -X DELETE http://localhost:3000/pokemon/<FAVORITE_UUID> \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

Respuesta esperada (200):

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

Errores comunes:

- 404 si el favorito no pertenece al usuario autenticado o no existe

## 4. Capturas de pantalla de la UI

### 4.1 Pantalla de autenticacion

![Pantalla de autenticacion](./Capturas%20de%20UI/auth_page.png)

### 4.2 Dashboard

![Dashboard](./Capturas%20de%20UI/dashboard_page.png)

### 4.3 Pantalla para agregar pokemon (catalogo)

![Agregar pokemon - catalogo](./Capturas%20de%20UI/add_pokemon_page.png)

### 4.4 Pantalla para agregar pokemon (detalle + formulario)

![Agregar pokemon - detalle](./Capturas%20de%20UI/add_pokemon_page_2.png)

### 4.5 Detalle de favorito

![Detalle de favorito](./Capturas%20de%20UI/pokemon_detail_page.png)

### 4.6 Editar favorito

![Editar favorito](./Capturas%20de%20UI/edit_pokemon.png)

## Notas finales

- El backend usa variables de entorno en src/app.module.ts para la conexion a PostgreSQL.
- synchronize esta habilitado para desarrollo y se recomienda deshabilitarlo en produccion.
