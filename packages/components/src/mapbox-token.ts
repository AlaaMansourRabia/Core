/**
 * Shared Mapbox access token for every map surface in the library.
 *
 * This is a public (`pk.`) token — it is safe to ship in client bundles, and
 * Mapbox scopes it via URL restrictions rather than secrecy. Keep this module
 * as the single source of truth so swapping the token is a one-line change.
 */

// Vite environment type
declare const __VITE_MAPBOX_TOKEN__: string | undefined;

const getMapboxToken = (): string => {
	// Vite/browser environment - check for injected define
	if (typeof __VITE_MAPBOX_TOKEN__ !== "undefined") {
		return __VITE_MAPBOX_TOKEN__;
	}
	// Try import.meta.env (Vite)
	try {
		const env = (import.meta as unknown as {env?: Record<string, string>}).env;
		if (env?.VITE_MAPBOX_TOKEN) {
			return env.VITE_MAPBOX_TOKEN;
		}
	} catch {
		// import.meta.env not available
	}
	// Node.js environment
	if (typeof process !== "undefined" && process.env?.MAPBOX_TOKEN) {
		return process.env.MAPBOX_TOKEN;
	}
	return "";
};

const MAPBOX_TOKEN = getMapboxToken();

export {MAPBOX_TOKEN};
