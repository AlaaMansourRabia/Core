/**
 * Shared Mapbox access token for every map surface in the library.
 *
 * This is a public (`pk.`) token — it is safe to ship in client bundles, and
 * Mapbox scopes it via URL restrictions rather than secrecy. Keep this module
 * as the single source of truth so swapping the token is a one-line change.
 */
const MAPBOX_TOKEN = process.env.MAPBOX_TOKEN || "";

export {MAPBOX_TOKEN};
