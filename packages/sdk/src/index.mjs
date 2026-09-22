// @core/sdk — the Core "brain": deterministic resolution + validation + PageInstance
// generation over the real Core catalog (manifests/*.json + library-index.json).
//
// This is the single source-of-truth SDK the whole platform consumes. Core Studio drives it
// through an LLM planner; a future MCP server / Open Design engine can consume the exact same API.
// Nothing here is coupled to any client.

export {createSdk} from "./sdk.mjs";
export {loadCatalog} from "./catalog.mjs";

import {createSdk} from "./sdk.mjs";
import {loadCatalog} from "./catalog.mjs";

/** Convenience: build an SDK bound to the live repo catalog. */
export function loadSdk() {
	return createSdk(loadCatalog());
}
