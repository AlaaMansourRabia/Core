/**
 * Shared Mapbox access token for every map surface in the library.
 *
 * This is a public (`pk.`) token — it is safe to ship in client bundles, and
 * Mapbox scopes it via URL restrictions rather than secrecy. Keep this module
 * as the single source of truth so swapping the token is a one-line change.
 */
const getMapboxToken = (): string => {
	// Vite/browser environment
	if (typeof import.meta !== "undefined" && import.meta.env?.VITE_MAPBOX_TOKEN) {
		return import.meta.env.VITE_MAPBOX_TOKEN;
	}
	// Node.js environment
	if (typeof process !== "undefined" && process.env?.MAPBOX_TOKEN) {
		return process.env.MAPBOX_TOKEN;
	}
	return "";
};

const MAPBOX_TOKEN = getMapboxToken();

export {MAPBOX_TOKEN};
