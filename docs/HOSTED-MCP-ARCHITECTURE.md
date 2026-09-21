# WakeCore Hosted MCP — Architecture (Phase 1)

> The MCP protocol is just one transport; the **knowledge model and API are the product.**

WakeCore is the source of truth for UI authoring. Editors (Claude Code, Codex, Cursor, Windsurf,
Gemini, …) should never need to understand our repository or search our codebase — they ask **one
knowledge API** which template fits an intent, which widgets compose a screen, which component to
use, what the correct import is, whether generated code is valid, and why an artifact exists.

This document describes the Phase-1 implementation: a versioned, editor-agnostic **knowledge
platform** (`@wakecap/knowledge`) exposed over MCP (`wakecore-hosted-mcp`) via Streamable HTTP and
stdio. No auth, database, or deployment yet — but the seams are in place so a database can replace the
filesystem **without changing the API**.

---

## Layers

```
 Canonical repo data  (the ONLY source of truth — never duplicated)
   manifests/*.json · library-index.json · eval/contracts/component-api.json · tokens · docs
        │
        │  indexing pipeline  (buildIndex — boot-time; optional knowledge-index.json artifact)
        ▼
 @wakecap/knowledge   ── the Knowledge Platform (TypeScript, built with tsdown)
   • NormalizedRecord      one unified shape across all tiers
   • KnowledgeStore        the DB-swap seam (FileSystemStore now → DbStore later)
   • SearchProvider        pluggable ranking (LexicalSearchProvider now → embeddings later)
   • capabilities          resolve_template · resolve_widgets · resolve_component · search · validate · explain
   • zod schemas           the versioned input contract (→ JSON Schema)
   • callTool()            validates, runs, wraps every response in the versioned envelope
        │
        │  capabilities are pure, transport-agnostic, JSON, versioned
        ▼
 wakecore-hosted-mcp  ── the Hosted MCP server (TypeScript)
   • MCP over Streamable HTTP  (POST /mcp, stateless)     ← hosted editors
   • MCP over stdio                                        ← local editors
   • GET /health · /ready · /schemas · /metrics
   • structured logging (stderr) · metrics seam · CORS
        ▼
 Editors: Claude Code · Codex · Cursor · Windsurf · Gemini · …
```

### Why two units (and not one)

- `@wakecap/knowledge` owns *knowledge*; `wakecore-hosted-mcp` owns *transport*. That is the whole
  thesis — the knowledge model must be importable by CI, evals, the SDK, and any number of transports
  without dragging in an HTTP stack. MCP is one client of the knowledge API, not its definition.
- The existing `@wakecap/sdk` (deterministic page-composition/PageInstance engine) and `@wakecap/mcp`
  (its stdio wrapper) are **untouched** in Phase 1. Phase 2 converges them onto this platform (the SDK
  becomes a client of `@wakecap/knowledge`; today there are three separate `loadCatalog` readers).

---

## Data sources → the normalized index

The index is **generated** from canonical data on boot (`buildIndex`, ~140 small JSON files, fast).
Nothing is hand-duplicated.

| Source | Contributes |
| --- | --- |
| `manifests/*.json` (`artifact-manifest/0.2`) | the frozen semantic truth: intent, when/whenNot, chooseOver, regions, requiredWidgets, composedOf, commonMistakes, lineage |
| `library-index.json` (generated projection) | per-component `variants` / `sizes` / `import` / `path` |
| `eval/contracts/component-api.json` (generated) | structured **props** (available for a subset today — the rest report `propsStatus: "unavailable"`) |

Every artifact — template, widget, component, pattern, utility — is projected into one
**`NormalizedRecord`** so the Store and ranking never branch on tier. Tier-specific fields (regions,
widgets, variants, props, …) are optional on that one shape. A future `DbStore` persists the *same*
shape, which is why the capabilities are already database-ready.

### The `KnowledgeStore` seam

Capabilities read knowledge **only** through `KnowledgeStore` (`getById` / `getByName` /
`listByTier` / `reverse` / `searchProvider` / `meta`) — never the filesystem, never a global. Swapping
`FileSystemStore` for a `DbStore` that implements the same interface changes nothing above it. That is
the migration guarantee.

---

## The capability API (`wakecore-knowledge/2026-07`)

Every response is the same **versioned envelope** (errors are values, never thrown across the wire):

```jsonc
{ "apiVersion": "wakecore-knowledge/2026-07",
  "capability": "resolve_template",
  "requestId": "req_…",
  "ok": true,
  "data": { /* capability-specific */ },
  "warnings": [ { "code": "…", "message": "…", "target": "…" } ],
  "provenance": { "indexVersion": "knowledge-index/0.1", "manifestSchema": "artifact-manifest/0.2",
                  "sources": [ { "id": "…", "tier": "…", "manifest": "manifests/…" } ] },
  "meta": { "elapsedMs": 3, "count": 3 } }
// on failure: { …, "ok": false, "error": { "code", "message", "retryable", "target" } }
```

| Tool | Kind | Returns |
| --- | --- | --- |
| `resolve_template(intent)` | advisory (fuzzy intent-match) | ranked candidates + score/confidence + when/whenNot + which resolve-path is next (`hasWidgets`/`hasComposedOf`/`regionsCount`) |
| `resolve_widgets(template)` | deterministic (graph-walk) | unified widget composition + ordering + `requiredDependencies`; handles all three template shapes |
| `resolve_component(intent\|name)` | advisory | import, variants/sizes, when/chooseOver, minimalExample, **props (when available)** |
| `search(query)` | advisory | ranked refs across all tiers with intent snippets |
| `validate(code)` | **authoritative** (deterministic) | pass/fail + per-metric findings (imports, component-choice, provider-wiring, anti-patterns) |
| `explain(id)` | reference | purpose, when/when-not, chooseOver, alternatives, commonMistakes, related templates/widgets |

Two invariants from the WakeCore knowledge model are enforced here:

1. **Two-operation retrieval.** `resolve_template`/`search` do the *fuzzy* intent match; everything
   reachable is resolved by a *deterministic structural graph-walk* (`resolve_widgets`, `explain`
   reverse-lookups) — never re-discovered by keyword.
2. **Advisory vs authoritative.** `resolve_*`/`search` rank and suggest; only `validate` is
   deterministic truth. Advisory output never mints authoritative truth.

### `resolve_widgets` — unifying the three template shapes

Templates declare their composition three different ways (plus thin templates that declare none). The
prior SDK read only one, silently returning empty for most templates. `resolve_widgets` unifies all
and reports how it got the answer:

| Authored as | `shape` | Note |
| --- | --- | --- |
| `requiredWidgets` / `optionalWidgets` | `widgets` | authored widget lists (e.g. `dashboard`) |
| `regions[].recommended` | `regions` | synthesized → warns `widgets.derived_from_regions` |
| `composedOf` | `composed` | component/widget building blocks (e.g. `admin-panel`, `login-page`) → warns `widgets.derived_from_composedOf` |
| none | `thin` | not yet widgetized → `notes` points to `minimalExample`/lineage |

### The props gap (honest, not fabricated)

Component manifests carry no props. Structured props exist only where
`eval/contracts/component-api.json` has them; elsewhere `resolve_component` returns `props: null`,
`propsStatus: "unavailable"`, and a `props.unavailable` warning. Props are **never invented**.
Generalizing the extractor (`scripts/extract-component-api.mjs`) to all components is the first
Phase-2 indexing task.

### Ranking (Phase 1)

`LexicalSearchProvider` — deterministic, dependency-free BM25-lite: field-weighted term matching
(name > tags > intent > when) with IDF, normalized to 0..1. `resolve_template`, `resolve_component`,
and `search` all route through the one `SearchProvider`, so a future `EmbeddingSearchProvider` upgrades
all three at once **with no API change**. `confidence` is derived from the score, never hand-set.

---

## Transports & observability

- **Streamable HTTP** (`POST /mcp`, stateless): a fresh server+transport per request — the simplest
  thing that scales horizontally; `sessionIdGenerator`/auth seams are left for later.
- **stdio**: parity with `@wakecap/mcp` for local editors. stdout is the MCP channel; **all logs go to
  stderr.**
- **Operational**: `GET /health` (liveness), `/ready` (index built + tier counts), `/schemas`
  (self-describing — JSON Schema per tool), `/metrics` (in-memory per-capability counters).
- **Logging**: one structured JSON line per event/tool call (requestId, capability, ok, elapsedMs).
- **Out of scope (Phase 1), seams left**: auth (`ctx.auth`), database (`KNOWLEDGE_STORE`), deploy.

---

## Versioning

- `apiVersion` is date-based (`wakecore-knowledge/2026-07`): additive changes keep it, breaking
  changes bump it (the server can serve multiple later).
- Independent schema versions travel in `provenance` (`manifestSchema`, `indexVersion`).
- Tool input schemas are the checked-in **zod** schemas (served as JSON Schema at `/schemas`) — a
  reviewed, versioned change, never ad-hoc. `@wakecap/knowledge` carries its own semver (`0.1.0`).

---

## Running it

```bash
pnpm --filter @wakecap/knowledge build      # build the knowledge core
pnpm --filter wakecore-hosted-mcp build      # build the server

# hosted (HTTP) — default
PORT=4100 node apps/hosted-mcp/dist/main.mjs
curl localhost:4100/ready
curl localhost:4100/schemas

# local (stdio) — for an editor to spawn
node apps/hosted-mcp/dist/main.mjs --stdio
```

Tests: `pnpm --filter @wakecap/knowledge test` (capabilities) and
`pnpm --filter wakecore-hosted-mcp test` (both transports via the real MCP client).

Editor config (Streamable HTTP), e.g.:

```jsonc
{ "mcpServers": { "wakecore": { "url": "http://localhost:4100/mcp" } } }
```

---

## Phase-2 roadmap (not built yet)

- **Props everywhere** — generalize `extract-component-api.mjs` to all components → richer
  `resolve_component`.
- **Embedding re-rank** — an `EmbeddingSearchProvider` behind the existing `SearchProvider` seam.
- **DbStore** — Postgres/pgvector implementing `KnowledgeStore`; index becomes warm-start from a
  generated `knowledge-index.json` rather than a boot-time rebuild.
- **SDK convergence** — re-express `@wakecap/sdk` as a client of `@wakecap/knowledge`; point
  `@wakecap/mcp` at the shared tool surface (one definition, one loader).
- **Auth, caching, observability** — fill the seams (`ctx.auth`, response cache, OTel exporter).
- **More tools** — `generate_page_instance`, `promote_artifact`, `compare_templates`,
  `generate_pattern`, `lint_workspace`, `generate_story`, `evaluate_quality`.
