// GET /api/auth/login — start the GitHub OAuth web flow (DEVELOPER_HANDOFF.md §3.1).
// Sets a short-lived CSRF `state` cookie (+ optional return_to), then 302 → GitHub authorize.

import {getOrigin, safeReturnTo, serializeCookie, STATE_TTL_SECONDS} from "./_session.mjs";

export default function handler(req, res) {
	const clientId = process.env.GITHUB_CLIENT_ID;
	if (!clientId) return res.status(500).send("GITHUB_CLIENT_ID is not set");

	const state = crypto.randomUUID();
	const returnTo = safeReturnTo(req.query?.return_to);

	const params = new URLSearchParams({
		client_id: clientId,
		redirect_uri: `${getOrigin(req)}/api/auth/callback`,
		scope: "read:org",
		state,
		allow_signup: "false",
	});

	res.setHeader("Set-Cookie", [
		serializeCookie("wc_oauth_state", state, {maxAge: STATE_TTL_SECONDS}),
		serializeCookie("wc_return_to", returnTo, {maxAge: STATE_TTL_SECONDS}),
	]);
	res.redirect(`https://github.com/login/oauth/authorize?${params}`);
}
