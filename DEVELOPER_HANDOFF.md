# WakeCore — GitHub OAuth Org-Gating: Developer Handoff

**Repo:** `wakecap/Wakecore`  ·  **Prod:** `https://core.wakecap.com`  ·  **Owner (ops):** Ahmed Hassan
**Status:** ⏸️ Blocked on backend — the auth code does not exist yet; ops provisioning is on hold until it lands.
**Last updated:** 2026-07-16

---

## 1. Why this doc exists

The ops runbook (register a GitHub OAuth App + set 3 Vercel env vars) was about to be executed, but a
source check of `wakecap/Wakecore` shows **the consuming backend has not been built on any branch**
(`main`, `develop`, `feat/*`) or open PR:

| Expected by the ops steps | Present in repo today? |
|---|---|
| `GET /api/auth/callback` handler | ❌ No `api/auth/*` at all |
| Reads of `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` / `AUTH_SECRET` | ❌ Not referenced anywhere |
| Session cookie + `wakecap` org-membership check | ❌ None |
| Request gating (middleware) that bounces anon users to GitHub | ❌ None (`vercel.json` catch-all `/(.*)` → `/index.html`) |
| `/health`, `/ready`, `/schemas`, `/mcp` public endpoints | ✅ Exist via `api/mcp.mjs` — **must stay open** |

If we set env vars + redeploy now, the build succeeds but the site stays **fully open** — nothing reads
the credentials. **The backend below must ship first.** Then, and only then, ops provisions and verifies.

> **Stack reality:** Wakecore is a **Vite SPA** (`apps/web/dist/index.html`) plus Vercel serverless
> functions in `api/*.mjs` — **not Next.js**. So gating is done with a Vercel **Edge Middleware**
> (`middleware.js` at repo root), not Next middleware. This is the one architectural decision to confirm
> (§4).

---

## 2. The contract (dev ⇄ ops must agree on these exact strings)

These are the values ops will provision. **The backend must read these exact names / paths.**

| Item | Value (must match char-for-char) |
|---|---|
| Homepage URL | `https://core.wakecap.com` |
| Authorization callback URL | `https://core.wakecap.com/api/auth/callback` |
| Env var — client id | `GITHUB_CLIENT_ID` |
| Env var — client secret | `GITHUB_CLIENT_SECRET` |
| Env var — session signing key | `AUTH_SECRET` (64-char hex = 32 bytes, HMAC-SHA256 key) |
| Org to gate on | `wakecap` |
| OAuth scope requested | `read:org` (enough to verify membership; add `read:user` only if you want a display name) |
| Denial message (exact copy) | `Access denied. You must be a member of the wakecap organization.` |

**Public (never gated) allowlist:** `/api/auth/*`, `/mcp`, `/health`, `/ready`, `/schemas`, and static
assets (`/assets/*`, `/favicon*`, `/storybook/*`). Everything else requires a valid session.

---

## 3. Endpoints to build (`api/auth/*`)

Standard GitHub OAuth **web application flow** + an org-membership gate. Four functions:

### 3.1 `GET /api/auth/login`
- Generate a random `state` (CSRF); set it in a short-lived, `HttpOnly`, `Secure`, `SameSite=Lax` cookie.
- Optionally capture a post-login `return_to` path (validate it's a same-origin relative path).
- `302` → `https://github.com/login/oauth/authorize` with:
  `client_id=$GITHUB_CLIENT_ID`, `redirect_uri=https://core.wakecap.com/api/auth/callback`,
  `scope=read:org`, `state=<state>`, `allow_signup=false`.

### 3.2 `GET /api/auth/callback?code=…&state=…`
1. Verify `state` matches the cookie; reject on mismatch (`400`).
2. Exchange code → token: `POST https://github.com/login/oauth/access_token`
   (body `client_id`, `client_secret`, `code`, `redirect_uri`; header `Accept: application/json`) → `access_token`.
3. **Org check** with the user token:
   `GET https://api.github.com/user/memberships/orgs/wakecap` (header `Authorization: Bearer <token>`).
   - `200` + `{ "state": "active" }` → **member** ✅
   - `404` / non-active → **not a member** → render the denial copy from §2 (`403`).
4. (Optional) `GET https://api.github.com/user` for `login`/`name` to store in the session.
5. On success: set the **session cookie** (§5), `302` → `return_to` or `/`.

### 3.3 `GET /api/auth/me`
- Reads + verifies the session cookie. `200 {login,name,exp}` if valid, else `401`.
- The SPA uses this to render the signed-in user / show the top-bar **Sign out** button.

### 3.4 `POST /api/auth/logout`
- Clear the session cookie (`Max-Age=0`), `302` → `/api/auth/login` (so the user re-bounces to GitHub).

---

## 4. The gate — `middleware.js` (repo root, Edge runtime)

Runs before routing on every request. Pseudocode:

```js
export const config = { matcher: ['/((?!assets/|favicon|storybook/).*)'] };

export default async function middleware(req) {
  const { pathname } = new URL(req.url);
  const PUBLIC = ['/api/auth/', '/mcp', '/health', '/ready', '/schemas'];
  if (PUBLIC.some(p => pathname === p || pathname.startsWith(p))) return; // pass through

  const ok = await verifySession(req.cookies.get('wc_session'), process.env.AUTH_SECRET);
  if (ok) return; // authenticated → serve normally
  return Response.redirect(new URL('/api/auth/login?return_to=' + encodeURIComponent(pathname), req.url), 302);
}
```

- **Keep MCP + health open** — the allowlist above is why verification step 5 (`curl /health`) must return
  JSON with no redirect.
- **Decision to confirm:** Vercel Edge Middleware on a non-Next project. If the team prefers not to add
  root middleware, the fallback is a client-side guard that calls `/api/auth/me` and redirects to
  `/api/auth/login` on `401` — simpler, but it only hides the UI, it does not block direct asset fetches.
  **Recommendation: middleware** (true gate). Pick one and note it in the PR.

---

## 5. Session cookie design

- Name `wc_session`; attributes `HttpOnly; Secure; SameSite=Lax; Path=/`.
  (`Lax` is required so the cookie is sent on the top-level redirect back from GitHub.)
- Payload `{ login, name, exp }` (e.g. 7-day expiry), base64url-encoded.
- Signed with `AUTH_SECRET` via **HMAC-SHA256** (Web Crypto `crypto.subtle` — works in the Edge runtime).
  Cookie value = `<payload>.<signature>`; verify signature **and** `exp` on every request.
- Never store the GitHub access token in the cookie — it's only needed during the callback.

---

## 6. Local development

- A GitHub OAuth App allows **one** callback URL, so register a **second** OAuth App for local:
  callback `http://localhost:3000/api/auth/callback`; put its id/secret + an `AUTH_SECRET` in `.env.local`.
- `pnpm dev` (Vite) does **not** run Vercel middleware, so local dev stays unauthenticated by default —
  that's expected and fine for UI work. Use `vercel dev` to exercise the real gated flow locally.

---

## 7. Acceptance criteria (maps 1:1 to ops verification)

| # | Test | Passes when |
|---|---|---|
| 1 | Open `core.wakecap.com` in a private window | Redirects to GitHub sign-in |
| 2 | Approve as a `wakecap` member | Lands back on the app, signed in |
| 3 | Click **Sign out** (top bar) | Returns to GitHub login |
| 4 | Sign in as a non-member | Shows exactly: `Access denied. You must be a member of the wakecap organization.` |
| 5 | `curl https://core.wakecap.com/health` | Returns JSON, **no redirect** (MCP stays open) |

---

## 8. Rollback

- Auth is **fail-open only by removal**: to disable, delete/rename `middleware.js` and redeploy — the SPA
  serves unauthenticated again (its pre-auth behavior). The `api/auth/*` functions become dead endpoints,
  harmless.
- Env vars can stay set (inert without middleware). To fully revert, remove `GITHUB_CLIENT_ID/SECRET` and
  `AUTH_SECRET` from Vercel and delete the OAuth App(s) in the org.
- Keep the change behind a single reviewable PR so revert = revert the PR + redeploy.

---

## 9. Handoff checklist — sequencing

**Developers (must land first):**
- [ ] `api/auth/login`, `api/auth/callback`, `api/auth/me`, `api/auth/logout`
- [ ] Root `middleware.js` gate with the §2 public allowlist (or documented client-side fallback)
- [ ] Signed-session helper (`AUTH_SECRET`, HMAC-SHA256)
- [ ] SPA: top-bar shows signed-in user + **Sign out**; wire the denial screen copy
- [ ] `vercel.json`: confirm `/api/auth/*` is reachable (not swallowed by the `/(.*)` → `index.html` rewrite)
- [ ] `.env.example` documents `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `AUTH_SECRET`
- [ ] PR opened; note which gating approach was chosen

**Ops (Ahmed — after the PR merges / is on a preview):**
- [ ] Register prod OAuth App (org `wakecap`) — homepage + callback per §2 → capture Client ID + secret
- [ ] `openssl rand -hex 32` → `AUTH_SECRET`
- [ ] Set the 3 env vars in Vercel (Production; Preview if gating previews) → redeploy
- [ ] Run acceptance tests §7 (incl. a non-member account for #4)
- [ ] (Optional) register a second OAuth App for `localhost` and share its id/secret with devs for `vercel dev`
