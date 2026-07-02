# To-Let Backend (NestJS + Sequelize + Azure SQL)

The API foundation for the To-Let rental platform. This first slice covers the
project scaffold, the full data model, and authentication + role-based access
control — the layer every other module builds on.

## What's in this slice

- **Scaffold:** NestJS app, global config, global `ValidationPipe`, CORS, `/api` prefix.
- **Data model (Sequelize):** 13 `sequelize-typescript` models for Azure SQL Database
  (users, profiles, properties, media, inquiries, conversations/messages, agent
  assignments, reviews, notifications) with the SQL-Server-specific workarounds
  documented inline (geography column, junction tables, JSON columns, emulated enums).
- **Auth + RBAC:** register / login / refresh / logout with JWT access + refresh
  tokens, argon2 password hashing, rotating refresh tokens (hashed at rest),
  a `JwtAuthGuard`, a `RolesGuard`, and `@Roles()` / `@CurrentUser()` decorators.

## ORM notes (Sequelize on SQL Server)

- Uses `@nestjs/sequelize` + `sequelize-typescript` + the `tedious` mssql driver.
- `tsconfig` sets `useDefineForClassFields: false` — required so class fields
  don't shadow Sequelize's attribute accessors on modern TS targets.
- The `geography` column for radius search is **not** a model field (Sequelize
  can't model it). It's added by `migrations/manual-geography.sql` and kept in
  sync with a raw query on insert/update; radius queries run via `sequelize.query()`.
- `synchronize` auto-creates tables in dev only; use migrations (sequelize-cli /
  umzug) + the manual SQL in production.

## Assumptions made (easy to change)

- Payments/booking are **out of v1 scope** — this is a connection platform.
- Agents **self-register and start unapproved**; an admin approves them later.
- Property **owners enter their own addresses**.
- **Admins are never self-registered** — create them out-of-band.

## Setup

```bash
npm install
cp .env.example .env        # fill in DB_* vars + JWT secrets
npm run start:dev           # dev: auto-creates tables via synchronize
# then apply the spatial column / indexes / checks Sequelize can't model:
#   sqlcmd ... -i migrations/manual-geography.sql
```

## Endpoints in this slice

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| POST | `/api/auth/register` | — | SEEKER / OWNER / AGENT (not ADMIN) |
| POST | `/api/auth/login` | — | returns access + refresh tokens |
| POST | `/api/auth/refresh` | refresh token | rotates tokens |
| POST | `/api/auth/logout` | access token | clears stored refresh token |
| GET | `/api/users/me` | access token | own profile |
| GET | `/api/users/admin-ping` | access token + ADMIN | RBAC demo |

## Next slices (not yet built)

1. **Properties + Media** — listing CRUD, Azure Blob SAS upload flow.
2. **Search** — the raw `STDistance` geography queries for radius search.
3. **Messaging** — REST history + Socket.IO gateway (Redis adapter).
4. **Agents** — request + assignment engine.
5. **KYC** — provider integration + webhook + action gating.
6. **Frontend** — the React app.
