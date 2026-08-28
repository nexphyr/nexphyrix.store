# Link Database API Documentation

This API powers the Link Database Management System. It uses RESTful principles, receives and returns JSON, and relies on standard HTTP status codes.

## Authentication

Authentication is handled via HTTP-only, secure cookies containing a JWT. 
- You MUST pass `withCredentials: true` from the frontend to ensure cookies are sent.
- Public endpoints (`/api/public/*`) do not require authentication.
- Admin endpoints (`/api/admin/*`) require authentication and the `admin` role.

---

## Public Endpoints

### 1. Get All Categories
`GET /api/public/categories`

Returns all available categories.

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": 1,
      "name": "PS4 Sub Indo",
      "slug": "ps4-sub-indo"
    }
  ]
}
```

### 2. Search Links (Titles Only)
`GET /api/public/links`

Returns links matching search criteria. **Crucially, the `url` field is omitted from the response.**

**Query Parameters:**
- `search`: String (optional) - Partial match on title.
- `category`: String (optional) - Category slug.
- `page`: Number (optional) - Default 1.
- `limit`: Number (optional) - Default 20.

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": 1,
      "title": "Resident Evil 4 Remake",
      "category": {
        "name": "PS4 Sub Indo"
      }
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

---

## Auth Endpoints

### 1. Login
`POST /api/auth/login`

**Request Body:**
```json
{
  "username": "admin",
  "password": "yourpassword"
}
```

**Response (200 OK):**
Sets the `token` HTTP-only cookie.
```json
{
  "message": "Login berhasil",
  "user": {
    "username": "admin",
    "role": "admin"
  }
}
```

### 2. Logout
`POST /api/auth/logout`

Clears the token cookie.

**Response (200 OK):**
```json
{
  "message": "Logout berhasil"
}
```

### 3. Get Current User
`GET /api/auth/me`

**Response (200 OK):**
```json
{
  "user": {
    "username": "admin",
    "role": "admin"
  }
}
```

---

## Admin Endpoints (Requires Auth)

### 1. Dashboard Stats
`GET /api/admin/stats`

**Response (200 OK):**
```json
{
  "totalLinks": 150,
  "totalCategories": 5,
  "ps4LinksCount": 120,
  "recentLinks": []
}
```

### 2. CRUD Links
`GET /api/admin/links` - Retrieve links (including `url`).
`POST /api/admin/links` - Create a new link.
`PUT /api/admin/links/:id` - Update an existing link.
`DELETE /api/admin/links/:id` - Delete a link.

### 3. CRUD Categories
`GET /api/admin/categories` - Retrieve categories.
`POST /api/admin/categories` - Create a new category.
`PUT /api/admin/categories/:id` - Update an existing category.
`DELETE /api/admin/categories/:id` - Delete a category.
