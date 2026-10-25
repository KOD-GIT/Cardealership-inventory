# API Contract

Base URL (local): `http://localhost:8000` · Interactive docs: `/docs` (Swagger) and `/redoc`

**Conventions**
- JSON in, JSON out. Errors use `{"detail": "message"}`; validation errors use FastAPI's default 422 body.
- Protected endpoints need `Authorization: Bearer <access_token>`.
- Money is a decimal number with at most 2 decimals (`25999.99`), stored internally as cents. It is sent as a JSON **number**, never a string.
- JWT: HS256, claims `sub` (user id), `role`, `iat`, `exp` (default 60 min).

## Permission matrix

| Endpoint | Anonymous | USER | ADMIN |
|---|:-:|:-:|:-:|
| POST /api/auth/register | ✅ | ✅ | ✅ |
| POST /api/auth/login | ✅ | ✅ | ✅ |
| GET /api/vehicles | ❌ 401 | ✅ | ✅ |
| GET /api/vehicles/search | ❌ 401 | ✅ | ✅ |
| POST /api/vehicles | ❌ 401 | ❌ 403 | ✅ |
| PUT /api/vehicles/:id | ❌ 401 | ❌ 403 | ✅ |
| DELETE /api/vehicles/:id | ❌ 401 | ❌ 403 | ✅ |
| POST /api/vehicles/:id/purchase | ❌ 401 | ✅ | ✅ |
| POST /api/vehicles/:id/restock | ❌ 401 | ❌ 403 | ✅ |

> The kata only marks delete and restock as "Admin only". Create/update being admin-only too is **my decision**, to keep stock and catalogue changes with admins. To follow the spec literally, swap `require_admin` for `get_current_user` on those two routes.

## Auth

### POST /api/auth/register → 201
```json
// request
{ "email": "jane@example.com", "password": "Str0ngPass!" }
// response
{ "id": 1, "email": "jane@example.com", "role": "USER" }
```
Errors: `409` email already registered · `422` invalid email / password shorter than 8 characters or longer than 72 **bytes** (bcrypt's limit).
The request can never set `role`; extra fields are ignored.

### POST /api/auth/login → 200
```json
// request
{ "email": "jane@example.com", "password": "Str0ngPass!" }
// response
{ "access_token": "<jwt>", "token_type": "bearer",
  "user": { "id": 1, "email": "jane@example.com", "role": "USER" } }
```
Errors: `401` wrong email or password (same message for both, so accounts can't be enumerated).

## Vehicles

Vehicle object:
```json
{ "id": 7, "make": "Toyota", "model": "Camry", "category": "SEDAN",
  "price": 27999.99, "quantity": 4, "year": 2024, "image_url": null,
  "created_at": "2026-10-25T09:30:00Z" }
```
`price` is in rupees (a JSON number, at most `99,999,999.99`). `created_at` is when the vehicle arrived in the inventory (ISO 8601, UTC);
the "newest arrival" sort uses it, never the model year. Requests never send `id` or `created_at`.
Categories: `SEDAN, SUV, HATCHBACK, COUPE, CONVERTIBLE, TRUCK, VAN`.

| Endpoint | Request | Success | Errors |
|---|---|---|---|
| `POST /api/vehicles` | `make, model, category, price (>0), quantity (>=0)`, optional `year, image_url` | `201` vehicle | 401, 403, 422 |
| `GET /api/vehicles` | – | `200` list of **all** vehicles (including `quantity: 0`) | 401 |
| `GET /api/vehicles/search` | query: `make`, `model`, `category`, `min_price`, `max_price` (all optional, combined with AND) | `200` list (possibly empty) | 401, 422 (e.g. `min_price > max_price`) |
| `PUT /api/vehicles/:id` | any subset of the create fields (partial update) | `200` vehicle | 401, 403, 404, 422 |
| `DELETE /api/vehicles/:id` | – | `204` | 401, 403, 404 |

Search rules: `make` and `model` are case-insensitive partial matches; `category` is an exact match; `min_price`/`max_price` are inclusive.
Route order matters: declare `/search` **before** `/{vehicle_id}`.

## Inventory

### POST /api/vehicles/:id/purchase → 200
```json
// request (body optional, quantity defaults to 1)
{ "quantity": 1 }
// response: the updated vehicle
{ "id": 7, "make": "Toyota", "model": "Camry", "category": "SEDAN",
  "price": 27999.99, "quantity": 3, "year": 2024, "image_url": null,
  "created_at": "2026-10-25T09:30:00Z" }
```
Errors: `401` · `404` vehicle not found · `409` out of stock / not enough stock · `422` quantity < 1.
Side effect: inserts a row into `purchases` (user, vehicle, quantity, price snapshot).

### POST /api/vehicles/:id/restock → 200  (Admin)
```json
{ "quantity": 10 }   // request, must be >= 1
```
Response: the updated vehicle. Errors: `401` · `403` · `404` · `422`.

## Status code cheat sheet

| Code | Used for |
|---|---|
| 200 / 201 / 204 | OK / created / deleted |
| 401 | missing, invalid or expired token; bad login |
| 403 | authenticated but not admin |
| 404 | vehicle not found |
| 409 | duplicate email, out of stock |
| 422 | request validation failed |
