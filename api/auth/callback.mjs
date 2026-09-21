// GET /api/auth/callback?code&state — finish GitHub OAuth (DEVELOPER_HANDOFF.md §3.2).
// 1) verify CSRF state, 2) exchange code→token (server-side, Client Secret), 3) check core org
// membership, 4) mint the signed wc_session cookie, 5) redirect to return_to (or /).

import {
	clearCookie,
	getCookie,
	getOrigin,
	nowSeconds,
	safeReturnTo,
	serializeCookie,
	SESSION_TTL_SECONDS,
	signSession,
} from "./_session.mjs";

const GITHUB_ORG = "core";
// Exact copy — ops verification test #4 asserts this string (DEVELOPER_HANDOFF.md §2, §7).
const DENIAL = "Access denied. You must be a member of the core organization.";

export default async function handler(req, res) {
	const code = req.query?.code;
	const state = req.query?.state;
	if (!code || typeof code !== "string") return res.status(400).send("Missing code parameter");

	// 1) CSRF: state must match the cookie set in /login.
	const cookieState = getCookie(req.headers.cookie, "wc_oauth_state");
	if (!state || !cookieState || cookieState !== state) return res.status(400).send("Invalid OAuth state");

	const origin = getOrigin(req);

	// 2) Exchange the code for an access token.
	const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
		method: "POST",
		headers: {"Content-Type": "application/json", Accept: "application/json"},
		body: JSON.stringify({
			client_id: process.env.GITHUB_CLIENT_ID,
			client_secret: process.env.GITHUB_CLIENT_SECRET,
			code,
			redirect_uri: `${origin}/api/auth/callback`,
		}),
	});
	const tokenData = await tokenRes.json();
	if (tokenData.error || !tokenData.access_token) {
		return res.status(401).send(`GitHub OAuth error: ${tokenData.error_description || "no access token"}`);
	}
	const accessToken = tokenData.access_token;
	const ghHeaders = {
		Authorization: `Bearer ${accessToken}`,
		"User-Agent": "core-auth",
		Accept: "application/vnd.github+json",
	};

	// 3) Org membership — the user's own membership record (honors private membership via read:org).
	const memRes = await fetch(`https://api.github.com/user/memberships/orgs/${GITHUB_ORG}`, {headers: ghHeaders});
	if (!memRes.ok) return res.status(403).send(DENIAL);
	const membership = await memRes.json();
	if (membership.state !== "active") return res.status(403).send(DENIAL);

	// 4) Optional profile for a display name.
	let login = "unknown";
	let name = "unknown";
	try {
		const userRes = await fetch("https://api.github.com/user", {headers: ghHeaders});
		if (userRes.ok) {
			const user = await userRes.json();
			login = user.login;
			name = user.name || user.login;
		}
	} catch {
		/* non-fatal */
	}

	// 5) Mint the session, clear the one-time cookies, redirect back.
	const token = await signSession({login, name, exp: nowSeconds() + SESSION_TTL_SECONDS}, process.env.AUTH_SECRET);
	const returnTo = safeReturnTo(getCookie(req.headers.cookie, "wc_return_to"));
	res.setHeader("Set-Cookie", [
		serializeCookie("wc_session", token, {maxAge: SESSION_TTL_SECONDS}),
		clearCookie("wc_oauth_state"),
		clearCookie("wc_return_to"),
	]);
	res.redirect(`${origin}${returnTo}`);
}
