# GitHub-only Sign-in (core org)

The app is gated behind GitHub OAuth — only **members of the `core` GitHub organization** can reach
the UI. There is no password/email login. This implements the contract in
[`DEVELOPER_HANDOFF.md`](../DEVELOPER_HANDOFF.md) so dev ⇄ ops stay aligned.

## How it works

```
Request for any app route
  → middleware.js (Vercel Edge) verifies the wc_session cookie
      valid   → request continues to the SPA
      missing → 302 /api/auth/login?return_to=<path> → github.com/login/oauth/authorize (scope: read:org)
GitHub → /api/auth/callback?code&state
  → verify CSRF state cookie
  → exchange code + CLIENT_SECRET for a token   (secret never touches the browser)
  → GET /user/memberships/orgs/core → must be state:"active"
  → sign wc_session (HMAC-SHA256) → set HttpOnly cookie (7 days) → redirect to return_to (or /)
```

- **Gate:** `middleware.js` (repo root, Edge runtime) — runs *before* the SPA is served.
- **Functions:** `api/auth/{login,callback,me,logout}.mjs` (Node serverless).
- **Session:** `wc_session = <payload>.<signature>`, HMAC-SHA256 over base64url JSON `{login,name,exp}`,
  keyed by `AUTH_SECRET` (Web Crypto — works in Edge + Node). Signature **and** `exp` checked every
  request. The GitHub token is never stored in the cookie.
- **Shared helper:** `api/auth/_session.mjs` — Web-API-only (no `jose`, no `Buffer`), imported by both
  the functions and the middleware.
- **Sign out:** `POST /api/auth/logout` — the top-bar button posts a form; the top bar also shows the
  signed-in user via `GET /api/auth/me`.

### What stays public (never gated)

The hosted **MCP surface** is consumed by external agents with no browser session, so the middleware
allowlists `/api/auth/*`, `/mcp`, `/health`, `/ready`, `/schemas`, plus static assets
(`/assets/*`, `/favicon*`, `/storybook/*`). Everything else requires a valid session.

## 1. Register a GitHub OAuth App  *(ops — Ahmed)*

GitHub → [github.com/organizations/core/settings/applications/new](https://github.com/organizations/core/settings/applications/new)

| Field | Value (must match char-for-char) |
|---|---|
| Homepage URL | `https://core.core.com` |
| Authorization callback URL | `https://core.core.com/api/auth/callback` |

Copy the **Client ID** and generate a **Client Secret**.

## 2. Set environment variables (Vercel → Settings → Environment Variables)

| Variable | Description |
|---|---|
| `GITHUB_CLIENT_ID` | From the OAuth App |
| `GITHUB_CLIENT_SECRET` | From the OAuth App — server-side only |
| `AUTH_SECRET` | 64-char hex (32-byte HMAC key). Generate: `openssl rand -hex 32` |

The org is hard-coded to `core` in `api/auth/callback.mjs` and the denial copy is the exact string
ops verifies: **`Access denied. You must be a member of the core organization.`**

## 3. Local development

`pnpm dev` (Vite) does **not** run the edge middleware or the `/api` functions, so the app is open
locally and the Sign-out UI hides (no `/api/auth/me`). Use `vercel dev` with a `.env` (and a second
OAuth App whose callback is `http://localhost:3000/api/auth/callback`) to exercise the real gate.

## 4. Acceptance tests (DEVELOPER_HANDOFF.md §7)

1. Open `core.core.com` in a private window → redirects to GitHub sign-in.
2. Approve as a core member → lands back on the app, signed in.
3. Click **Sign out** → returns to GitHub login.
4. Sign in as a non-member → shows exactly `Access denied. You must be a member of the core organization.`
5. `curl https://core.core.com/health` → JSON, **no redirect** (MCP stays open).

## Notes

- Rotate `AUTH_SECRET` to invalidate all sessions immediately.
- To disable auth entirely: delete/rename `middleware.js` and redeploy (rollback, §8 of the handoff).
