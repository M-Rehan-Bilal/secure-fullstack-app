# Frontend Spec: React App (Project 01)
 
> Instructions for an LLM/developer: build exactly what is described here. Do not add features, libraries or pages beyond this document. Keep the code simple and readable, because both students must be able to explain every line in a viva.
 
## 1. Context
 
This is the frontend of a three-tier app (frontend, REST API, database) used for a computer networks lab. The app is only the system under study, so it must be **simple and correct**, not fancy.
 
- The frontend is built once (`npm run build`) and copied to a server where **Nginx serves it as static files**.
- Nginx also proxies every `/api/` request to a separate backend. The browser only ever talks to the Nginx address.
- The frontend has **no secrets and no cryptography**. All authentication, hashing and encryption happen in the backend.
## 2. Hard Rules (do not break)
 
1. **Framework:** React (built with Vite). No plain HTML/JS pages.
2. **Relative API URLs only:** `/api/v1/...`. Never hard-code an IP, hostname or port. This means no CORS is needed.
3. **No token handling.** The JWT lives in an `HttpOnly` cookie set by the backend. The frontend must **never** read, store or send it manually.
   - Do NOT use `localStorage`, `sessionStorage` or an `Authorization` header.
   - Every `fetch` must use `credentials: "same-origin"`.
4. The frontend learns who is logged in by calling `GET /api/v1/auth/me`.
5. No secrets, keys or passwords anywhere in the code or in `.env` files.
6. Role checks in the UI (hiding buttons) are **cosmetic only**. The backend enforces the real permissions.
7. Keep dependencies minimal: `react`, `react-dom`, `react-router-dom`. Use plain `fetch` (no axios) and plain CSS (no UI library).
## 3. Tech Stack
 
| Item | Choice |
|---|---|
| Build tool | Vite (React template, JavaScript) |
| Routing | `react-router-dom` (BrowserRouter) |
| HTTP | native `fetch` |
| State | React `useState` / `useContext` only |
| Styling | one plain `index.css` |
 
## 4. Folder Structure
 
```
frontend/
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx
    ├── App.jsx                 # routes
    ├── index.css
    ├── api.js                  # single fetch wrapper
    ├── AuthContext.jsx         # current user + role
    ├── components/
    │   ├── Navbar.jsx
    │   ├── ProtectedRoute.jsx
    │   └── Message.jsx         # shows error/success text
    └── pages/
        ├── Register.jsx
        ├── Login.jsx
        ├── ChangePassword.jsx
        ├── Records.jsx         # form + list
        └── Status.jsx          # backend health info
```
 
## 5. Pages and Routes
 
| Route | Page | Access | Purpose |
|---|---|---|---|
| `/register` | Register | public | create an account |
| `/login` | Login | public | log in |
| `/records` | Records | logged in | form with 3+ fields and a list of stored records |
| `/change-password` | ChangePassword | logged in | change own password |
| `/status` | Status | public | show backend health (hostname, IP, DB reachable) |
| `/` | redirect | n/a | to `/records` if logged in, else `/login` |
| `*` | NotFound text | n/a | simple "Page not found" |
 
### 5.1 Register
- Fields: `username`, `password`, `confirm password`.
- Client check: passwords match and the password is at least 8 characters. (The backend validates again.)
- On `201`: show "Account created", then go to `/login`.
### 5.2 Login
- Fields: `username`, `password`.
- Submit `POST /api/v1/auth/login`. On `200`, call `/auth/me` (via the context) and go to `/records`.
- `401`: show "Invalid username or password".
- `429`: show "Too many login attempts. Please wait a minute and try again." (This is the Nginx rate limit and is needed for the lab test.)
### 5.3 Change Password
- Fields: `current password`, `new password`, `confirm new password`.
- Submit `PUT /api/v1/auth/password`. On `200`, show a success message.
- `401` means the session expired, so go to `/login`. `400` means show the error message.
### 5.4 Records (Student Feedback form + list)
Use a **Student Registration** form with these fields (the backend encrypts `phone` at rest):
 
| Field | Input type | Rules |
|---|---|---|
| `full_name` | text | required |
| `roll_no` | text | required |
| `phone` | text | required (sensitive, encrypted by the backend) |
| `department` | text | required |
 
- Below the form, show a table of all stored records with columns: Name, Roll No, Phone, Department, and an Actions column.
- The phone is returned already decrypted by the API. Just display it.
- Actions column: a **Delete** button, shown **only when role is `admin`**. It calls `DELETE /api/v1/records/{id}`. A `403` shows "Not allowed".
- Reload the list after every create or delete.
### 5.5 Status
- Calls `GET /api/v1/health` and displays `hostname`, `ip` and `database` (true/false) in a small box, with a Refresh button.
- This is used to show which tier answered (VM vs Docker deployment).
### 5.6 Navbar (all pages)
- Logged out: Register, Login, Status.
- Logged in: Records, Change Password, Status, `Logged in as <username> (<role>)`, Logout.
- Logout calls `POST /api/v1/auth/logout`, clears the user in the context, and goes to `/login`.
## 6. Auth Flow
 
1. On app start, `AuthContext` calls `GET /api/v1/auth/me`.
   - `200` means store `{ username, role }` in the context.
   - `401` means `user = null` (not logged in). This is normal, so do not show an error.
2. While this first call is running, show "Loading..." (so protected pages don't flash a redirect).
3. `ProtectedRoute`: if `user` is null, redirect to `/login`. Otherwise render the page.
4. Any API call returning `401` while the user is set means the session expired: set `user = null` and go to `/login`.
## 7. API Contract (frontend's expectations)
 
> The backend owner must match this contract. If the backend differs, change this file first and then the code.
 
**Response format** (all endpoints):
 
```json
// success
{ "success": true, "data": { }, "message": "optional text" }
 
// error
{ "success": false, "error": { "message": "Human readable text", "details": { "field": "reason" } } }
```
 
**Endpoints:**
 
| Method | Path | Body | Success | Errors |
|---|---|---|---|---|
| POST | `/api/v1/auth/register` | `{username, password}` | 201 | 400 |
| POST | `/api/v1/auth/login` | `{username, password}` | 200 (sets cookie) | 400, 401, 429 |
| POST | `/api/v1/auth/logout` | none | 200 (clears cookie) | none |
| GET | `/api/v1/auth/me` | none | 200 `data: {username, role}` | 401 |
| PUT | `/api/v1/auth/password` | `{current_password, new_password}` | 200 | 400, 401 |
| GET | `/api/v1/records` | none | 200 `data: [record, ...]` | 401 |
| POST | `/api/v1/records` | `{full_name, roll_no, phone, department}` | 201 | 400, 401 |
| DELETE | `/api/v1/records/{id}` | none | 200 | 401, 403, 404 |
| GET | `/api/v1/health` | none | 200 `data: {hostname, ip, database}` | 500 |
 
`record` = `{ id, full_name, roll_no, phone, department }`.
 
## 8. Fetch Wrapper (`src/api.js`)
 
Write **one** helper that all pages use:
 
```js
// Sketch only
export async function api(path, { method = "GET", body } = {}) {
  const res = await fetch(`/api/v1${path}`, {
    method,
    credentials: "same-origin",
    headers: body ? { "Content-Type": "application/json" } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
  let json = null;
  try { json = await res.json(); } catch { /* non-JSON, e.g. an Nginx error page */ }
  return { status: res.status, ok: res.ok, json };
}
```
 
It must return the **status code**, because the pages react to 400, 401, 403, 429 and 500 differently.
 
## 9. Error Messages by Status Code
 
| Status | UI behaviour |
|---|---|
| 400 | show `error.message`, and field `details` if present |
| 401 | on login: "Invalid username or password". Elsewhere: session expired, go to `/login` |
| 403 | "You are not allowed to do this" |
| 404 | "Not found" |
| 429 | "Too many attempts. Please wait a minute." |
| 500 or network failure | "Server error. Please try again later." |
 
## 10. UI Guidelines
 
- Simple and clean: one centered container, basic form styling, a plain table. No animations and no icon libraries.
- Disable the submit button while a request is in flight.
- Each form shows one message area (error in red, success in green).
- Do not use `dangerouslySetInnerHTML`. React's default escaping handles XSS.
- Never log the password or any response data to the console.
## 11. Local Development
 
`vite.config.js` proxies `/api` to the local backend so that relative URLs work:
 
```js
export default {
  server: {
    proxy: { "/api": "http://localhost:8000" },
  },
};
```
 
Run `npm install`, then `npm run dev`.
 
## 12. Build and Deployment
 
```bash
npm run build          # produces dist/
scp -r dist/* <user>@192.168.XX.10:/var/www/app/
```
 
- Nginx serves `dist/` and uses `try_files $uri /index.html;`, so refreshing on `/records` works with BrowserRouter.
- Use the same `dist/` for both the VM deployment and the Docker deployment (Nginx container). **No code changes between the two**, because all URLs are relative.
- `.gitignore` must contain `node_modules/` and `dist/`.
## 13. Acceptance Checklist
 
- [ ] Register, login, change-password and records pages work.
- [ ] The form has at least 3 fields, and the list shows the stored records.
- [ ] All API calls use `/api/v1/...` with `credentials: "same-origin"`.
- [ ] No `localStorage`, `sessionStorage` or `Authorization` header anywhere.
- [ ] After login, the user and role come from `GET /api/v1/auth/me`.
- [ ] Refreshing the page keeps the user logged in (cookie plus `/auth/me`).
- [ ] The delete button appears only for the admin role, and a `403` is handled.
- [ ] A `429` on login shows the rate-limit message.
- [ ] The Status page shows hostname, IP and DB reachability.
- [ ] `npm run build` succeeds, and the build works when served by Nginx over HTTPS.
- [ ] No secrets or hard-coded hosts in the source.
 