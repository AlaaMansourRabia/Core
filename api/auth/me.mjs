// GET /api/auth/me — the SPA calls this to render the signed-in user + Sign out (DEVELOPER_HANDOFF §3.3).
// 200 {login,name,exp} if the wc_session cookie is valid, else 401.

import {getCookie, verifySession} from "./_session.mjs";

export default async function handler(req, res) {
	const session = await verifySession(getCookie(req.headers.cookie, "wc_session"), process.env.AUTH_SECRET);
	if (!session) return res.status(401).json({authenticated: false});
	return res.status(200).json({login: session.login, name: session.name, exp: session.exp});
}
