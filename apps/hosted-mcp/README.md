# core-hosted-mcp

The **Hosted MCP server** — exposes the [`@core/knowledge`](../../packages/knowledge) capability
API to any AI editor over MCP, on two transports:

- **Streamable HTTP** (`POST /mcp`, stateless) — the hosted surface.
- **stdio** (`--stdio`) — for a local editor to spawn.

Plus operational endpoints: `GET /health`, `/ready`, `/schemas`, `/metrics`.

## Run

```bash
pnpm --filter @core/knowledge build
pnpm --filter core-hosted-mcp build

# hosted (HTTP), default
PORT=4100 node apps/hosted-mcp/dist/main.mjs
curl localhost:4100/ready
curl localhost:4100/schemas

# local (stdio)
node apps/hosted-mcp/dist/main.mjs --stdio
```

## Configuration (env)

| Var                      | Default     | Meaning                                                     |
| ------------------------ | ----------- | ----------------------------------------------------------- |
| `PORT`                   | `4100`      | HTTP port                                                   |
| `HOST`                   | `127.0.0.1` | HTTP bind address                                           |
| `LOG_LEVEL`              | `info`      | `debug` \| `info` \| `warn` \| `error` (JSON logs → stderr) |
| `CORE_ROOT`          | auto-detect | repo root for the knowledge index                           |
| `CORE_MCP_TRANSPORT` | `http`      | `stdio` to force stdio (same as `--stdio`)                  |

## Editor config (Streamable HTTP)

```jsonc
{"mcpServers": {"core": {"url": "http://localhost:4100/mcp"}}}
```

## Tools

`resolve_template` · `create_implementation_plan` · `resolve_widgets` · `resolve_component` · `search` · `validate` · `explain`.
Each returns the versioned envelope from `@core/knowledge`. See
[`docs/HOSTED-MCP-ARCHITECTURE.md`](../../docs/HOSTED-MCP-ARCHITECTURE.md).

The server instructions enforce a non-blocking Core workflow: resolve templates first, use
an exact import when confidently matched, otherwise adapt the nearest template, compose catalog
widgets/components, or create Core-aligned application UI. Missing workspace dependencies are
prepared when safe. Multi-route plans establish a normative shared-shell fingerprint, paired density,
explicit module boundaries, and route/region ownership before screen implementation. Semantic token
existence/type/role and CSS public-API ownership are enforced across CSS and TS/TSX. Every path requires a goal-specific `validate` call over the complete
TS/TSX, CSS, route, and entry-point `files` set before completion:

When screenshots are supplied, clients first produce `referenceAnalysis`, preserving the reference's
information architecture, density, hierarchy, and intent while assigning each region to a Core owner
or catalog gap. Runtime audit v4 checks desktop and 820px responsive layout, duplicate dividers, stationary-sidebar/content-scroll geometry, zero-gutter boundaries,
artifact-owned visuals, duplicate affordances, navigation semantics, and functional canvas state. The final
report distinguishes reference fidelity from Core fidelity.

- `core-imports` for import-level integration checks; component evaluation uses `core-showcase` with plan-scoped artifacts.
- `core-product` for product UI.
- `core-showcase` for Core demonstrations and evaluations.
- `core-template-strict` for strict selected-template reproduction.

`core-only` is a deprecated alias for `core-imports` and does not establish stronger
compliance. The workflow carries `implementationPlan` with the returned plan/contract identity, goal,
implementation mode, template context, application/artifact contract, route/region map, and structured
adapt-template substitutions into validation. Contract v2 product/showcase/screenshot plans also carry runtime
audit evidence covering route reachability, shell fingerprint and DOM continuity, owned computed styles,
shell geometry, interaction semantics, history behavior, console/accessibility errors, and required interactions. Clients must install the audit
dependency and package script returned by planning; a missing command is blocking. Completion reporting includes the compliance level,
detailed scores, tier/component coverage, token provenance, CSS ownership, route/runtime adoption,
imported/rendered/exercised artifact inventory, and blocking/advisory findings. Legacy clients may send
`code` until they can adopt `files`. This prevents standalone HTML/CSS
substitution without blocking novel interfaces or overstating an import-only result.

## Tests

```bash
pnpm --filter core-hosted-mcp test   # both transports via the real MCP client + endpoints
```

Auth, database, and deployment are intentionally out of scope in Phase 1 — the seams
(`ctx.auth`, `KNOWLEDGE_STORE`, host binding) are in place.
