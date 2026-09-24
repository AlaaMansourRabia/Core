import {Badge} from "@corensystem/coren-ui/badge";
import {Button} from "@corensystem/coren-ui/button";
import {Check, Copy, ExternalLink, RefreshCw, SquareTerminal, Wrench} from "lucide-react";
import {useEffect, useState} from "react";

// Developer Access — how an AI editor (Claude Code, Codex, Cursor, Windsurf, opencode, Gemini, …)
// connects to the Core Hosted MCP: the tool-agnostic knowledge API. Card-based layout: install the
// Codex plugin → inspect the MCP endpoint → connect a specific client with a ready-to-paste setup prompt.
// The endpoint is env-configurable (VITE_CORE_MCP_URL) so it shows the hosted URL once deployed.

function readEnv(key: string): string | undefined {
	try {
		return (import.meta as unknown as {env?: Record<string, string>}).env?.[key];
	} catch {
		return undefined;
	}
}

const MCP_URL = readEnv("VITE_CORE_MCP_URL") ?? "http://localhost:4100/mcp";
const MCP_BASE = MCP_URL.replace(/\/mcp\/?$/, "");
const MARKETPLACE_SOURCE = readEnv("VITE_CORE_MARKETPLACE_SOURCE") ?? "https://github.com/core/Core.git";
const PLUGIN_INSTALL = `Codex Desktop → Plugins → Add plugin marketplace
Source: ${MARKETPLACE_SOURCE}
Git ref: main
Sparse paths:
.agents/plugins
plugins/core

Install plugin: Core`;

const AGENT_PROMPT = `Use Core as the source of truth for any UI you build.
Connect to the Core MCP server "core" (${MCP_URL}).
Follow this mandatory workflow in order:
1. resolve_template — check for an exact page template first.
2. selectionGate — follow its strategy without asking for confirmation solely because confidence is low or no template matched.
3. create_implementation_plan — plan direct import, nearest-template adaptation, or Core composition before editing.
4. workspace setup — if needed, create or repair the React + TypeScript app and install @corensystem/coren-ui using environment-backed GitHub Packages authentication.
5. implementation — use an exact matching template; otherwise adapt the nearest template, compose widgets/components, or create missing application UI with Core tokens, patterns, interactions, and look and feel. Never use standalone HTML/CSS as a substitute.
6. validate — use mode=core-only; pass template only for direct-template mode. Do not report completion unless compliant=true.
Attempt safe workspace setup before reporting a blocker. Never commit package tokens or substitute another stack.`;

type ClientId = "codex-cli" | "claude-code" | "cursor" | "windsurf" | "opencode" | "generic";

const CLIENTS: {id: ClientId; label: string; note: string; config: string}[] = [
	{
		id: "codex-cli",
		label: "Codex CLI",
		note: "Edit ~/.codex/config.toml (or run: codex mcp add core).",
		config: `[mcp_servers.core]\nurl = "${MCP_URL}"`,
	},
	{
		id: "claude-code",
		label: "Claude Code",
		note: "One terminal command — no file editing.",
		config: `claude mcp add --transport http core ${MCP_URL}`,
	},
	{
		id: "cursor",
		label: "Cursor",
		note: "Add to ~/.cursor/mcp.json (global) or .cursor/mcp.json (project).",
		config: `{\n  "mcpServers": {\n    "core": { "url": "${MCP_URL}" }\n  }\n}`,
	},
	{
		id: "windsurf",
		label: "Windsurf",
		note: "Add to ~/.codeium/windsurf/mcp_config.json.",
		config: `{\n  "mcpServers": {\n    "core": { "serverUrl": "${MCP_URL}" }\n  }\n}`,
	},
	{
		id: "opencode",
		label: "opencode",
		note: "Add to opencode.json.",
		config: `{\n  "mcp": {\n    "core": { "type": "remote", "url": "${MCP_URL}", "enabled": true }\n  }\n}`,
	},
	{
		id: "generic",
		label: "Generic MCP",
		note: "Standard Streamable HTTP MCP config.",
		config: `{\n  "mcpServers": {\n    "core": { "url": "${MCP_URL}" }\n  }\n}`,
	},
];

function setupPrompt(c: {label: string; note: string; config: string}): string {
	return `Set up the Core MCP in ${c.label} for me.
Use the hosted MCP endpoint: ${MCP_URL}
Add an HTTP (Streamable HTTP) MCP server named "core".
${c.note}
If you edit the config directly, use:

${c.config}

Then verify by calling the "search" tool (e.g. search "confirm destructive action").
Follow Core's resolve → validate workflow and prefer Core artifacts over hand-writing UI.`;
}

type ServerStatus = "checking" | "online" | "offline";
const pluralize = (word: string, n: number): string =>
	n === 1 ? word : word.endsWith("y") ? `${word.slice(0, -1)}ies` : `${word}s`;

export default function DeveloperAccess() {
	const [status, setStatus] = useState<ServerStatus>("checking");
	const [counts, setCounts] = useState<Record<string, number> | null>(null);
	const [client, setClient] = useState<ClientId>("claude-code");

	async function probe() {
		setStatus("checking");
		try {
			const res = await fetch(`${MCP_BASE}/ready`, {signal: AbortSignal.timeout(2500)});
			if (!res.ok) throw new Error("not ready");
			const body = await res.json();
			setCounts(body.counts ?? null);
			setStatus("online");
		} catch {
			setCounts(null);
			setStatus("offline");
		}
	}

	useEffect(() => {
		void probe();
	}, []);

	const active = CLIENTS.find((c) => c.id === client) ?? CLIENTS[0];

	return (
		<div className="wwc:h-full wwc:overflow-y-auto">
			<div className="wwc:mx-auto wwc:max-w-5xl wwc:px-6 wwc:py-10">
				{/* Header */}
				<div className="wwc:flex wwc:items-start wwc:justify-between wwc:gap-4">
					<div className="wwc:min-w-0">
						<h1 className="wwc:text-3xl wwc:font-semibold wwc:tracking-tight">Developer Access</h1>
						<p className="wwc:mt-2 wwc:max-w-2xl wwc:text-sm wwc:text-muted-foreground">
							Connect agents to Core through the hosted MCP — the tool-agnostic knowledge API that answers which
							template fits, which widgets compose a screen, the correct import, and whether generated code is valid.
						</p>
					</div>
					<Button variant="outline" size="sm" onClick={() => void probe()} className="wwc:h-9 wwc:flex-shrink-0">
						<RefreshCw className={status === "checking" ? "wwc:h-4 wwc:w-4 wwc:animate-spin" : "wwc:h-4 wwc:w-4"} />
						Reload
					</Button>
				</div>

				{/* Row 1: plugin + endpoint */}
				<div className="wwc:mt-6 wwc:grid wwc:gap-4 wwc:lg:grid-cols-2">
					<Card>
						<h2 className="wwc:text-lg wwc:font-semibold">Bring Core into your coding agent</h2>
						<p className="wwc:mt-2 wwc:text-sm wwc:leading-relaxed wwc:text-muted-foreground">
							Install the Core Codex plugin to get the hosted MCP and its mandatory template-first workflow in one
							package — including strict Core-only validation before completion.
						</p>
						<div className="wwc:mt-4 wwc:flex wwc:flex-wrap wwc:gap-2">
							<CopyButton label="Copy Prompt" text={AGENT_PROMPT} variant="outline" />
							<CopyButton label="Get Plugin" text={PLUGIN_INSTALL} variant="outline" />
						</div>
						<p className="wwc:mt-4 wwc:text-xs wwc:leading-relaxed wwc:text-muted-foreground/80">
							The plugin installs the workflow and connects the live knowledge server. Other MCP clients can still use
							the endpoint directly.
						</p>
					</Card>

					<Card>
						<div className="wwc:flex wwc:items-start wwc:gap-3">
							<div className="wwc:flex wwc:h-9 wwc:w-9 wwc:flex-shrink-0 wwc:items-center wwc:justify-center wwc:rounded-lg wwc:bg-primary/10 wwc:text-primary">
								<SquareTerminal className="wwc:h-5 wwc:w-5" />
							</div>
							<div className="wwc:min-w-0">
								<h2 className="wwc:text-lg wwc:font-semibold">Hosted MCP endpoint</h2>
								<p className="wwc:mt-1 wwc:text-sm wwc:text-muted-foreground">
									Use this URL when an agent asks for the Core MCP server.
								</p>
							</div>
						</div>
						<div className="wwc:mt-4 wwc:rounded-lg wwc:border wwc:border-border wwc:bg-background wwc:p-3">
							<div className="wwc:flex wwc:items-center wwc:gap-2">
								<StatusDot status={status} />
								<code className="wwc:min-w-0 wwc:flex-1 wwc:overflow-x-auto wwc:whitespace-nowrap wwc:text-sm wwc:text-foreground">
									{MCP_URL}
								</code>
								<CopyButton label="Copy" text={MCP_URL} variant="ghost" iconOnly />
							</div>
						</div>
						<div className="wwc:mt-3 wwc:flex wwc:items-center wwc:justify-between wwc:gap-2">
							<span className="wwc:text-xs wwc:text-muted-foreground">
								{status === "online"
									? "Reachable"
									: status === "offline"
										? "Not reachable — start it locally"
										: "Checking…"}
							</span>
							{status === "online" && counts ? (
								<div className="wwc:flex wwc:flex-wrap wwc:justify-end wwc:gap-1.5">
									{Object.entries(counts).map(([tier, n]) => (
										<Badge key={tier} variant="neutralSoft" className="wwc:capitalize wwc:text-[10px]">
											{n} {pluralize(tier, n)}
										</Badge>
									))}
								</div>
							) : null}
						</div>
					</Card>
				</div>

				{/* Row 2: Codex plugin install */}
				<Card className="wwc:mt-4">
					<div className="wwc:flex wwc:flex-wrap wwc:items-start wwc:justify-between wwc:gap-4">
						<div className="wwc:min-w-0 wwc:max-w-xl">
							<h2 className="wwc:text-lg wwc:font-semibold">Install Core in Codex Desktop</h2>
							<p className="wwc:mt-2 wwc:text-sm wwc:leading-relaxed wwc:text-muted-foreground">
								Open Plugins, add the Core Git marketplace using the source, ref, and sparse paths below, then install
								Core. The plugin can bootstrap an empty React/TSX app and prevents matching templates from being
								replaced with standalone HTML/CSS.
							</p>
						</div>
						<CopyButton label="Copy install details" text={PLUGIN_INSTALL} variant="outline" />
					</div>
					<div className="wwc:mt-4">
						<CodeBlock code={PLUGIN_INSTALL} />
					</div>
				</Card>

				{/* Row 3: connect an MCP client */}
				<Card className="wwc:mt-4">
					<div className="wwc:flex wwc:flex-wrap wwc:items-start wwc:justify-between wwc:gap-4">
						<div className="wwc:min-w-0 wwc:max-w-xl">
							<h2 className="wwc:text-lg wwc:font-semibold">Connect an MCP client</h2>
							<p className="wwc:mt-2 wwc:text-sm wwc:leading-relaxed wwc:text-muted-foreground">
								Choose your agent and copy one setup prompt. Paste it into that agent — it should add the Core server
								and verify access without you touching config.
							</p>
						</div>
						<div className="wwc:flex wwc:flex-wrap wwc:gap-1 wwc:rounded-lg wwc:border wwc:border-border wwc:bg-muted/40 wwc:p-0.5">
							{CLIENTS.map((c) => (
								<button
									key={c.id}
									type="button"
									onClick={() => setClient(c.id)}
									className={`wwc:rounded-md wwc:px-3 wwc:py-1.5 wwc:text-xs wwc:font-medium wwc:transition-colors ${
										client === c.id
											? "wwc:bg-primary wwc:text-primary-foreground wwc:shadow-sm"
											: "wwc:text-muted-foreground wwc:hover:text-foreground"
									}`}
								>
									{c.label}
								</button>
							))}
						</div>
					</div>

					<div className="wwc:mt-5 wwc:grid wwc:gap-4 wwc:lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
						<div>
							<div className="wwc:flex wwc:items-center wwc:gap-2">
								<Wrench className="wwc:h-4 wwc:w-4 wwc:text-muted-foreground" />
								<h3 className="wwc:text-sm wwc:font-semibold">{active.label}</h3>
							</div>
							<p className="wwc:mt-2 wwc:text-xs wwc:leading-relaxed wwc:text-muted-foreground">
								Copy a prompt that tells {active.label} to add Core and verify the tools. {active.note}
							</p>
							<div className="wwc:mt-3">
								<CopyButton label="Copy Prompt" text={setupPrompt(active)} variant="outline" />
							</div>
						</div>
						<CodeBlock code={setupPrompt(active)} />
					</div>
				</Card>

				{/* Endpoints footer */}
				<div className="wwc:mt-4 wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-x-4 wwc:gap-y-1 wwc:px-1 wwc:text-xs wwc:text-muted-foreground">
					<span className="wwc:font-medium">Endpoints:</span>
					<code>POST /mcp</code>
					<code>GET /health</code>
					<code>GET /ready</code>
					<a
						href={`${MCP_BASE}/schemas`}
						target="_blank"
						rel="noopener noreferrer"
						className="wwc:inline-flex wwc:items-center wwc:gap-1 wwc:text-foreground wwc:hover:underline"
					>
						GET /schemas <ExternalLink className="wwc:h-3 wwc:w-3" />
					</a>
					<span className="wwc:ml-auto">Contract: core-knowledge/2026-07</span>
				</div>
			</div>
		</div>
	);
}

function Card({children, className = ""}: {children: React.ReactNode; className?: string}) {
	return (
		<div className={`wwc:rounded-xl wwc:border wwc:border-border wwc:bg-card wwc:p-5 ${className}`}>{children}</div>
	);
}

function StatusDot({status}: {status: ServerStatus}) {
	const color =
		status === "online"
			? "wwc:bg-emerald-500"
			: status === "offline"
				? "wwc:bg-destructive"
				: "wwc:bg-amber-500 wwc:animate-pulse";
	return <span className={`wwc:h-2.5 wwc:w-2.5 wwc:flex-shrink-0 wwc:rounded-full ${color}`} aria-hidden />;
}

function CodeBlock({code}: {code: string}) {
	return (
		<div className="wwc:relative wwc:overflow-hidden wwc:rounded-lg wwc:border wwc:border-border wwc:bg-background">
			<div className="wwc:absolute wwc:right-2 wwc:top-2">
				<CopyButton text={code} variant="ghost" iconOnly />
			</div>
			<pre className="wwc:overflow-x-auto wwc:p-4 wwc:pr-12 wwc:text-xs wwc:leading-relaxed wwc:text-foreground">
				<code>{code}</code>
			</pre>
		</div>
	);
}

function CopyButton({
	text,
	label,
	variant = "outline",
	iconOnly = false,
}: {
	text: string;
	label?: string;
	variant?: "outline" | "ghost";
	iconOnly?: boolean;
}) {
	const [copied, setCopied] = useState(false);
	const onClick = () => {
		void navigator.clipboard?.writeText(text);
		setCopied(true);
		setTimeout(() => setCopied(false), 1500);
	};
	if (iconOnly) {
		return (
			<Button
				variant={variant}
				icon
				aria-label={label ?? "Copy"}
				onClick={onClick}
				className="wwc:h-7 wwc:w-7 wwc:flex-shrink-0"
			>
				{copied ? (
					<Check className="wwc:h-3.5 wwc:w-3.5 wwc:text-emerald-500" />
				) : (
					<Copy className="wwc:h-3.5 wwc:w-3.5" />
				)}
			</Button>
		);
	}
	return (
		<Button variant={variant} size="sm" onClick={onClick} className="wwc:h-8">
			{copied ? (
				<Check className="wwc:h-3.5 wwc:w-3.5 wwc:text-emerald-500" />
			) : (
				<Copy className="wwc:h-3.5 wwc:w-3.5" />
			)}
			{copied ? "Copied" : label}
		</Button>
	);
}
