import assert from "node:assert/strict";
import test from "node:test";

import {validateCorePlugin} from "./verify-plugin.mjs";

test("Core plugin manifests, MCP wiring, goal-specific compliance gates, assets, and docs are valid", () => {
	assert.deepEqual(validateCorePlugin(), []);
});
