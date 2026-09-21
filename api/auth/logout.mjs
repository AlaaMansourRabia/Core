// POST /api/auth/logout — clear the session and re-bounce to GitHub (DEVELOPER_HANDOFF.md §3.4).

import {clearCookie} from "./_session.mjs";

export default function handler(req, res) {
	res.setHeader("Set-Cookie", clearCookie("wc_session"));
	res.redirect("/api/auth/login");
}
