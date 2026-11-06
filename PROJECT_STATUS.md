# Studio OS Status Report

## 1. Architecture Summary
**Current Stack:**
- **Frontend:** React (Vite) + Ant Design.
- **Backend:** Node.js (Express) + Prisma (SQLite).
- **Authentication:** JWT-based stateless auth.

**Wiring:**
- The frontend (`App.tsx`) initializes by checking for a JWT in `localStorage`.
- It validates the token via `GET /me` (backend/src/server.ts).
- If valid, the user's role/position is decoded and used to render the `MainLayout`.
- Sidebar navigation (`MainLayout.tsx`) is dynamic based on the `position` claim (FOUNDER, ADMIN, EDITOR, USER).
- Network requests use the `Authorization: Bearer <token>` header.

## 2. Security Protocol (Identity & Border Control)
**Identity System:**
- **Public ID:** Unique 7-character ID used for login (e.g., `yxk5283`).
  - **Generation Logic:** `FirstInitial + RandomChar + LastInitial + 4DigitRandomNumber`.
  - **Conflict Resolution:** The backend attempts generation until a unique ID is found.
- **Claims:** The JWT payload is the single source of truth for permissions.
  - Payload: `{ publicId, email, role, position, currentGame }`.

**Border Control:**
- **Backend:** 
  - `authenticateToken` middleware verifies the signature (HMAC SHA256).
  - `requireRole(["FOUNDER", "ADMIN"])` middleware enforces RBAC on specific routes.
- **Frontend:**
  - **Route Protection:** `App.tsx` checks `user.position` before rendering Admin routes.
  - **UI Visibility:** `MainLayout.tsx` hides/shows sidebar items based on the decoded token payload.

## 3. Phase 1 Completion Checklist

| Feature Area | Item | Status | Notes |
| :--- | :--- | :--- | :--- |
| **Identity** | Public ID Generation | **Done** | Implemented in `server.ts`. |
| | JWT Issuance | **Done** | Claims include `position` for RBAC. |
| **Database** | User Table | **Done** | Prisma model exists. |
| | IP Address Table | **Pending** | **MISSING** from `schema.prisma`. |
| | Project Table | **Pending** | **MISSING** from `schema.prisma`. |
| **Admin UI** | User List | **Done** | `UserTable.tsx` fetches from `/admin/users`. |
| | Role Promotion | **Done** | "Promote" button calls `/admin/promote`. |
| | Game Assignment | **Done** | Basic assignment implemented. |
| **Security** | Password Strength | **Done** | Regex enforcement on register. |
| | Role Hierarchy | **Done** | FOUNDER > ADMIN > USER distinctions active. |

## 4. Technical Debt & TODOs
**Critical:**
- [x] **Hardcoded Secret:** `JWT_SECRET` is now a required `.env` variable, read once in `backend/src/config.ts` (no fallback).
- [ ] **Missing Tables:** The `IPs` and `Projects` tables mentioned in requirements are completely absent from the database schema.
- [ ] **Monolithic Server:** `server.ts` contains all logic. Refactor into `routes/` and `controllers/` as the app grows.

**Minor:**
- [ ] **Frontend Decoding:** `App.tsx` uses `atob` for token decoding. Recommend using `jwt-decode` library for better reliability.
- [ ] **Error Handling:** Backend returns 500 for most DB errors. Granular error handling needed.

## 5. Hand-off Notes (For Flutter Agent)
**Replicating Logic:**
1.  **Login Flow:**
    - POST to `/login` with `{ publicId, password }`.
    - Store the returned `token`.
2.  **Role Handling:**
    - Decode the JWT. CAUTION: The standard Flutter `jwt_decoder` package works well here.
    - Check `position` field ("FOUNDER", "ADMIN", "USER").
    - **Do NOT** trust the user's local storage for permissions; always handle `403 Forbidden` responses from the API gracefully.
3.  **Registration:**
    - The backend handles `publicId` generation. You only need to send `{ firstName, lastName, ... }`.
    - Display the returned `publicId` to the user immediately after success; it is their only way to log in.
