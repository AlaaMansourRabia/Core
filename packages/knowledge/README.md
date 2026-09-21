# @core/knowledge

The **Core Knowledge Platform** — a versioned, transport-agnostic API over Core knowledge.
This is the product; MCP (`core-hosted-mcp`) is one transport over it.

It builds an in-memory index from the canonical repo data (`manifests/*.json` +
`library-index.json` + `eval/contracts/component-api.json`) and answers seven capabilities:

| Capability                   | What it answers                                                                 |
| ---------------------------- | ------------------------------------------------------------------------------- |
| `resolve_template`           | Which template best matches this intent? (ranked, with confidence + next-path)  |
| `create_implementation_plan` | Which import/adaptation/composition path, setup, and gate must be used?         |
| `resolve_widgets`            | Which widgets/components compose this template? (deterministic graph-walk)      |
| `resolve_component`          | Which component, what import, which variants/props, an example?                 |
| `search`                     | Semantic search across templates/widgets/components/patterns/utilities          |
| `validate`                   | Is this generated **code** valid Core usage? (authoritative, deterministic) |
| `explain`                    | Why does this artifact exist? When (not) to use it? Alternatives?               |

## Usage

```ts
import {createKnowledge} from "@core/knowledge";

const kb = createKnowledge(); // builds the index from the repo (auto-detects root)
const res = await kb.callTool("resolve_template", {intent: "admin settings page", limit: 3});
// → { apiVersion, capability, requestId, ok, data, warnings, provenance, meta }

kb.tools; // [{name, description}] — for a transport to advertise
kb.jsonSchemas(); // JSON Schema per tool input (MCP inputSchema / a /schemas endpoint)
kb.meta(); // { indexVersion, manifestSchema, counts, builtAt, rootDir }
```

## Strict Core implementation workflow

For UI generation, clients must follow this sequence:

1. Call `resolve_template`; an exact match uses `direct-template`, while low-confidence/no-match results return an executable fallback strategy without requiring confirmation.
2. Call `create_implementation_plan` with the intent, strategy, and selected/nearest template when available before editing files.
3. Follow the fallback order: exact template → adapt nearest template → compose widgets → compose components → create application UI with Core primitives, tokens, patterns, and look and feel.
4. If React, TSX, or `@core/core-ui` is missing, prepare the workspace and continue unless setup genuinely fails.
5. Call `validate` with `{mode: "core-only", code: "..."}`; include `template` only for `direct-template` mode.
6. Do not report completion unless `data.compliant` is `true`. Low template confidence alone is never a blocker.

Every response is a **versioned envelope**; errors are values (`ok: false`), never thrown.

## Architecture

- **`NormalizedRecord`** (`src/model/record.ts`) — one unified shape across all tiers.
- **`KnowledgeStore`** (`src/store/`) — the DB-swap seam. Capabilities read only through it;
  `FileSystemStore` now, a `DbStore` later, same interface.
- **`SearchProvider`** (`src/search/`) — pluggable ranking. `LexicalSearchProvider` (BM25-lite) now;
  an embedding provider drops in with no API change.
- **`buildIndex`** (`src/pipeline/`) — projects canonical sources into the index + reverse graph.
- **capabilities** (`src/capabilities/`) — pure functions over the Store; `callTool` validates
  (zod), runs, and wraps the envelope.

Design invariants: **two-operation retrieval** (fuzzy intent-match + deterministic graph-walk),
**advisory vs authoritative** (`resolve_*`/`search` suggest; `validate` is truth), **provenance on
every response**, and **never duplicate canonical data**.

See [`docs/HOSTED-MCP-ARCHITECTURE.md`](../../docs/HOSTED-MCP-ARCHITECTURE.md) for the full picture.

## Scripts

```bash
pnpm build       # tsdown → dist (.mjs + .d.mts)
pnpm typecheck   # tsgo --noEmit
pnpm test        # node --test (runs against dist — build first)
```

## Not yet (Phase 2)

Structured props for every component (extractor generalization), embedding re-rank, a `DbStore`,
and convergence of `@core/sdk` onto this platform.
