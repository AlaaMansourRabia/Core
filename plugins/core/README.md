# Core Codex plugin

This repository-owned plugin connects Codex to the production Core MCP at
`https://core.core.com/mcp` and installs the `core-ui` skill. The skill makes the following
sequence mandatory for React UI work:

`resolve_template` → `selectionGate` → `create_implementation_plan` → implementation →
goal-specific multi-file `validate`

An exact direct-template match must be imported from `@core/core-ui`; it cannot be silently replaced
by standalone HTML/CSS. Low-confidence and no-match results do not block. The skill automatically
adapts the nearest template, composes Core widgets/components, or creates missing application-level
UI with Core primitives, tokens, interaction patterns, and look and feel. For multi-route work, the
implementation plan defines one shared shell plus route/region ownership before individual screens. It
also drives an artifact utilization map and, for template adaptation, a structured substitution map.
The contract records a normative shell fingerprint (paired artifacts and density, brand, navigation,
footer, provider ownership, and allowed route mutations) and explicit module boundaries. Token validation
checks existence, semantic role, value type, and raw colors in both stylesheets and TS/TSX. CSS ownership
blocks internal role/state/slot selectors and hybrid component variants. For an empty workspace, the skill
also scaffolds React and TypeScript, installs Core, implements, validates, and runs the app.

Reference-image tasks begin with a blocking `referenceAnalysis` before template resolution. The analysis
maps the reference shell, navigation, density, regions, hierarchy, scroll ownership, semantic relationships,
and interactions while identifying source-brand traits that Core must replace. Each region is then
bound to a Core owner or an explicit catalog gap. Runtime audit v4 verifies contiguous shell geometry,
a stationary sidebar with route-owned scrolling, artifact-owned DataTable/chart/tab visuals, unique
surface boundaries/affordances, responsive layout at desktop and 820px, honest navigation, and functional canvas behavior. Completion reports reference fidelity and
Core fidelity separately.

Validation modes describe the claim being made:

- `core-imports`: import-level integration checks.
- `core-product`: normal product UI adoption.
- `core-showcase`: meaningful Core demonstration or evaluation.
- `core-template-strict`: strict reproduction of a selected template.

`core-only` remains a deprecated alias for `core-imports`; it must not be used to claim product,
showcase, or strict-template compliance. Validation should receive the complete TS/TSX, CSS, route, and
entry-point `files` set plus `implementationPlan`, including the returned plan/contract identity,
application/artifact contract, goal, implementation mode, route/region map, template context, and
adapt-template substitutions. Contract v2 product/showcase and screenshot validation also requires
`runtimeAudit` v4 evidence for every planned route, shared-shell fingerprint and DOM continuity, owned
computed visuals, shell geometry, two-viewport responsive layout, interaction semantics, history behavior, and required interactions. The plan also requires installing Playwright and adding a
runnable `audit:runtime` script; an absent command is a workspace-preparation failure.
Use legacy `code` only with a deployed server that does not yet accept `files`.

## Local development

From the repository root:

```bash
pnpm validate:codex-plugin
python3 "$CODEX_HOME/skills/.system/plugin-creator/scripts/validate_plugin.py" plugins/core
codex plugin marketplace add .
codex plugin add core@core
```

Restart the ChatGPT desktop app after adding the local marketplace. Test in a new task so Codex loads
the newly installed skill and MCP configuration. Use `codex plugin marketplace list` and
`codex plugin list` to verify the `core` marketplace and plugin are present.

## Authentication

The production endpoint is public today and requires no credential. Never add tokens, cookies, or
authorization header values to `.mcp.json` or any other committed file.

`@core/core-ui` is distributed through GitHub Packages. Workspace bootstrap writes only the
environment-backed registry configuration below; the token itself must stay in the user's environment
and needs `read:packages`:

```ini
@core:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
```

If `NODE_AUTH_TOKEN` is absent and `gh` is authenticated, the skill may use `gh auth token` only for
the install process without printing or persisting it.

If Core enables bearer authentication, configure the server with Codex's environment-backed
`bearer_token_env_var` setting and export the secret only in the user's environment:

```json
{
	"mcpServers": {
		"core": {
			"type": "http",
			"url": "https://core.core.com/mcp",
			"bearer_token_env_var": "CORE_MCP_TOKEN"
		}
	}
}
```

```bash
export CORE_MCP_TOKEN="<value-from-the-Core-team>"
```

Do not use a literal bearer token or static `Authorization` value. For OAuth, use Codex's MCP login
flow after Core publishes OAuth metadata instead of committing credentials.

## Cachebuster and updates

During local development, update the manifest cachebuster with the installed plugin-creator helper:

```bash
python3 "$CODEX_HOME/skills/.system/plugin-creator/scripts/update_plugin_cachebuster.py" plugins/core
pnpm validate:codex-plugin
codex plugin add core@core
```

Restart the desktop app and open a new task after reinstalling. For a hosted release, commit the
cachebuster change, deploy the marketplace assets, refresh the marketplace in Codex Desktop, and
reinstall the plugin.

## Verification

1. Confirm `https://core.core.com/health` returns `core-knowledge`.
2. Confirm the plugin is installed and enabled in the desktop plugin directory.
3. Start a new task and ask Codex to build a React screen that matches a Core template.
4. Verify the task calls `resolve_template` before edits, follows `selectionGate.strategy`, calls
   `create_implementation_plan`, records artifact utilization, follows the exact/adapt/compose fallback
   order, and finishes with the goal-specific validation mode and `compliant=true`.
5. Repeat in an empty fixture with GitHub Packages access; verify the task creates the React/TSX app,
   installs Core, implements the selected template, and runs it locally.
6. Repeat without package credentials; verify the task attempts setup, reports the credential recovery
   step precisely, and does not produce standalone HTML/CSS.
7. Use a screenshot with no confident template match; verify implementation continues without a
   confirmation prompt, uses the nearest Core structure or catalog components, and validates
   with its artifact utilization map and adapt-template substitutions.
8. Verify the final report distinguishes imported, rendered, and exercised inventory; includes detailed
   scores, token provenance, CSS ownership, route/runtime coverage, artifact coverage, blocking findings,
   and advisory findings; and does not promote
   `core-imports` compliance to a stronger claim.

The repository-level hosting guide is in [`.agents/plugins/README.md`](../../.agents/plugins/README.md).
