// Standalone proof that the WakeCore MCP server speaks MCP correctly — mirrors what Open Design's
// client does: spawn the stdio server, list tools, and call the generate path end to end.
import {Client} from "@modelcontextprotocol/sdk/client/index.js";
import {StdioClientTransport} from "@modelcontextprotocol/sdk/client/stdio.js";
import {dirname, join} from "node:path";
import {fileURLToPath} from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const transport = new StdioClientTransport({command: "node", args: [join(HERE, "src/server.mjs")]});
const client = new Client({name: "test-client", version: "0.0.0"}, {capabilities: {}});
await client.connect(transport);

const {tools} = await client.listTools();
console.log("TOOLS:", tools.map((t) => t.name).join(", "));

const resolved = await client.callTool({name: "resolve_template", arguments: {intent: "a login page"}});
const top = JSON.parse(resolved.content[0].text).candidates[0];
console.log("resolve_template top:", top.name, top.ref.id, `(score ${top.score})`);

const gen = await client.callTool({name: "generate_page_instance", arguments: {template_id: top.ref.id, fill: "recommended"}});
const page = JSON.parse(gen.content[0].text);
console.log("generate_page_instance:", {
	schemaVersion: page.page.schemaVersion,
	widgets: page.page.widgets.map((w) => w.widget),
	validation: page.validation.summary,
	buildable: page.validation.buildable,
});

await client.close();
console.log("OK");
