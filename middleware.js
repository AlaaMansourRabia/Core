// Vercel Edge Middleware — the gate (DEVELOPER_HANDOFF.md §4). Runs before routing on every request.
// Anonymous users are bounced to GitHub sign-in; the hosted MCP + health endpoints stay public so
// external agents (which carry no browser session) keep working. Session is verified with the shared
// Web Crypto HMAC helper (edge-compatible — no jose, no node builtins).

import {getCookie, verifySession} from "./api/auth/_session.mjs";

// Public: the login page + auth endpoints, and the hosted MCP surface (no browser session).
// BRAND is here because /login renders before any session exists: its logo and the favicon are
// plain <img>/<link> requests, and gating them answers with the login HTML instead of an image —
// which is exactly how the logo renders broken. Keep this list in sync with `config.matcher`
// below (scripts/validate-hosted-assets.mjs fails the build if they drift apart).
const BRAND = ["/wakecap.svg", "/wakecore-"]; // "/wakecore-" covers wakecore-large.svg + -small.svg
const PUBLIC = ["/login", "/api/auth/", "/mcp", "/health", "/ready", "/schemas", ...BRAND];

export default async function middleware(req) {
	const {pathname, origin} = new URL(req.url);

	if (PUBLIC.some((p) => pathname === p || pathname.startsWith(p))) return; // pass through

	const token = getCookie(req.headers.get("cookie") || "", "wc_session");
	const session = await verifySession(token, process.env.AUTH_SECRET);
	if (session) return; // authenticated → serve normally

	// Anonymous → the login page (which shows the "Continue with GitHub" button), preserving where
	// they were headed so the callback can return them there.
	const loginUrl = new URL(`/login?return_to=${encodeURIComponent(pathname)}`, origin);
	return Response.redirect(loginUrl, 302);
}

export const config = {
	// Vite-emitted bundles live under assets/, Storybook owns storybook/, and the brand files are
	// the login screen's own images (see BRAND above) — none of them are gated.
	matcher: ["/((?!assets/|favicon|storybook/|wakecap.svg|wakecore-).*)"],
};
