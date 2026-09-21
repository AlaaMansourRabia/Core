// Shared session + cookie helpers for the GitHub OAuth gate (DEVELOPER_HANDOFF.md §5).
// Underscore-prefixed → Vercel does NOT treat this as a route. Imported by BOTH the Node serverless
// functions (api/auth/*.mjs) AND the Edge middleware (middleware.js), so it must use ONLY Web APIs —
// crypto.subtle, TextEncoder/TextDecoder, btoa/atob, Date — and no node: builtins or Buffer.
//
// Session cookie: `wc_session = <payload>.<signature>`, where payload is base64url(JSON) and signature
// is base64url(HMAC-SHA256(payload)) keyed by AUTH_SECRET (64-char hex → 32 raw bytes). Signature AND
// exp are verified on every request. The GitHub access token is never stored — only needed at callback.

export const SESSION_COOKIE = "wc_session";
export const STATE_COOKIE = "wc_oauth_state";
export const RETURN_TO_COOKIE = "wc_return_to";
export const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days
export const STATE_TTL_SECONDS = 10 * 60; // 10 minutes

// --- base64url (Buffer-free, works in Edge + Node) ---------------------------------------------

function bytesToB64url(bytes) {
	let s = "";
	for (const b of bytes) s += String.fromCharCode(b);
	return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlToBytes(str) {
	const bin = atob(str.replace(/-/g, "+").replace(/_/g, "/"));
	const out = new Uint8Array(bin.length);
	for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
	return out;
}

const strToB64url = (s) => bytesToB64url(new TextEncoder().encode(s));
const b64urlToStr = (b) => new TextDecoder().decode(b64urlToBytes(b));

function hexToBytes(hex) {
	const clean = String(hex || "");
	const out = new Uint8Array(clean.length / 2);
	for (let i = 0; i < out.length; i++) out[i] = parseInt(clean.substr(i * 2, 2), 16);
	return out;
}

async function hmacKey(secretHex) {
	if (!secretHex) throw new Error("AUTH_SECRET is not set");
	return crypto.subtle.importKey("raw", hexToBytes(secretHex), {name: "HMAC", hash: "SHA-256"}, false, [
		"sign",
		"verify",
	]);
}

export function nowSeconds() {
	return Math.floor(Date.now() / 1000);
}

// --- sign / verify --------------------------------------------------------------------------------

export async function signSession(payload, secretHex) {
	const body = strToB64url(JSON.stringify(payload));
	const key = await hmacKey(secretHex);
	const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
	return `${body}.${bytesToB64url(new Uint8Array(sig))}`;
}

// Returns the decoded payload if the signature is valid and the token is unexpired, else null.
export async function verifySession(token, secretHex) {
	if (typeof token !== "string" || !token.includes(".")) return null;
	const [body, sig] = token.split(".");
	if (!body || !sig) return null;
	let ok = false;
	try {
		const key = await hmacKey(secretHex);
		ok = await crypto.subtle.verify("HMAC", key, b64urlToBytes(sig), new TextEncoder().encode(body));
	} catch {
		return null;
	}
	if (!ok) return null;
	try {
		const payload = JSON.parse(b64urlToStr(body));
		if (typeof payload.exp === "number" && payload.exp * 1000 < Date.now()) return null;
		return payload;
	} catch {
		return null;
	}
}

// --- cookies --------------------------------------------------------------------------------------

export function getCookie(cookieHeader, name) {
	for (const pair of String(cookieHeader || "").split(";")) {
		const i = pair.indexOf("=");
		if (i === -1) continue;
		if (pair.slice(0, i).trim() === name) return decodeURIComponent(pair.slice(i + 1).trim());
	}
	return undefined;
}

export function serializeCookie(name, value, {maxAge} = {}) {
	const parts = [`${name}=${encodeURIComponent(value)}`, "Path=/", "HttpOnly", "Secure", "SameSite=Lax"];
	if (maxAge !== undefined) parts.push(`Max-Age=${maxAge}`);
	return parts.join("; ");
}

export const clearCookie = (name) => serializeCookie(name, "", {maxAge: 0});

// --- misc -----------------------------------------------------------------------------------------

// Only allow same-origin, relative return paths (defeats open-redirect via ?return_to=).
export function safeReturnTo(p) {
	if (typeof p !== "string" || !p.startsWith("/") || p.startsWith("//") || p.includes("\\")) return "/";
	return p;
}

export function getOrigin(req) {
	const proto = String(req.headers["x-forwarded-proto"] || "https")
		.split(",")[0]
		.trim();
	const host = String(req.headers["x-forwarded-host"] || req.headers.host || "")
		.split(",")[0]
		.trim();
	return `${proto}://${host}`;
}
