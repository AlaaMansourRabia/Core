import assert from "node:assert/strict";
import test from "node:test";

import {validateWakeCorePlugin} from "./verify-plugin.mjs";

test("WakeCore plugin manifests, MCP wiring, goal-specific compliance gates, assets, and docs are valid", () => {
	assert.deepEqual(validateWakeCorePlugin(), []);
});
