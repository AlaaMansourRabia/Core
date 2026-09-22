# Core Studio (Core ↔ Open Design)

**Core Studio** is the third Core product (alongside Storybook and the Designer Hub). It is the
interface where AI builds software using **Core only** — it never invents UI. Studio is not a new
editor: it **is** [Open Design](https://github.com/nexu-io/open-design), guided by Core. Core's
value is its knowledge, templates, widgets, governance, and renderer — not a rebuilt AI-editor UI, so
Studio leverages the open-source editor and constrains it to Core. The same integration works for
any AI editor that can mount an MCP server and inject a skill.

## Run it

```bash
pnpm studio        # wires Core into Open Design, starts the renderer, boots Studio, prints the URL
```

Default engine is your local **Claude CLI** (your own Claude subscription — **no Anthropic API key**).
Prereqs: an Open Design checkout at `/tmp/open-design` (or set `OD_DIR`), Node 24 for OD, and an
authenticated `claude` on your PATH.

## The three artifacts

## The three artifacts

1. **Core MCP server** — `@core/mcp` (`packages/mcp`). The tool-agnostic intelligence API:
   `list_templates`, `resolve_template`, `resolve_widgets`, `generate_page_instance`, `validate_page`.
   Wraps `@core/sdk`. Not OD-specific.
2. **`plugin/`** — the OD glue: `SKILL.md` (mandates the consult-Core-first workflow and forces
   immediate execution), `open-design.json` (the plugin manifest), and `install.mjs` (wires an OD
   instance). Plus `design-systems/core/DESIGN.md` (Core brand/tokens as an OD design system).
3. **`renderer/`** — the Core renderer bundle + `serve.mjs`. OD emits a small `index.html` that
   loads `window.Core.render` from this CORS server and renders the PageInstance. (OD's own preview
   can't import `@core/core-ui`, so we render via the prebuilt bundle by URL.)

## How it flows

```
User prompt in Open Design
  → OD spawns its agent (claude), injects .mcp.json (Core) + the core-compose SKILL
  → agent calls Core MCP: resolve_template → generate_page_instance (validated PageInstance)
  → agent writes index.html using the Core render wrapper
  → OD renders it → real Core UI
```

## Run it

Prereqs: an Open Design checkout (default `/tmp/open-design`), Node 24 for OD, and an agent CLI on
PATH that OD can drive (e.g. authenticated `claude`).

```bash
# 1. Wire Core into the OD instance (installs the skill + registers the MCP server)
node integrations/open-design/plugin/install.mjs        # OD_DIR / OD_DATA_DIR overridable

# 2. Start the Core renderer (CORS, :8787)
node integrations/open-design/renderer/serve.mjs

# 3. Start Open Design (Node 24)
cd /tmp/open-design && OD_DATA_DIR=/tmp/od-data pnpm tools-dev run web
```

Then, in the OD web app, any of:

- **Native template rail (best — click → build):** OD's own "Start with a template…" rail _and_ the
  "Search templates" picker ARE the Core templates (Regular Dashboard, Detail, …),
  each badged ✓ Ready / ◐ Partial / ○ Not built yet. Click one → it immediately generates that template
  through Core and opens the project editor. No plugin, no form, no typing. (This is a **source
  patch to the OD clone** — `od-home-templates.patch`, applied by `install.mjs`; needs an OD restart.
  It edits `chips.ts` + the Home dispatcher, so it's a fork of OD's UI, not a portable plugin.)
- **Templates gallery plugin (portable):** open the **Core Templates** plugin → pick a template
  from the dropdown → Send. Same result via OD's plugin system, no OD source changes.
- **Prompt + skill:** new project → select the `core-compose` skill → prompt e.g.
  "an operations dashboard".

Or drive it headlessly:

```bash
node integrations/open-design/demo-run.mjs "an operations dashboard"
# creates a project, runs on the claude agent with skillId=core-compose, writes index.html
```

## Status / limitations (first end-to-end demo)

- **Proven:** OD prompt → consults Core MCP → Core chooses a template + widgets →
  `generate_page_instance` validates → OD writes and renders the page. `CoreOrgOverview` is retained as
  a product route and is intentionally not offered as a selectable template; its KPIBar and MapControls
  widgets remain available for composition.
- The `core-compose` skill **must be selected** for a run (UI skill picker, or `skillId` via API);
  otherwise OD's default discovery/planning charter runs and ignores Core.
- The renderer server (:8787) must be running for the preview to render; the bundle is loaded by
  absolute URL into OD's sandboxed iframe.
- Only Core-widgetized regions render fully (e.g. dashboard KPI strip); others show as empty
  regions and Core's validation flags them honestly (no faked UI).
- Data binding is not wired — widgets render with default/placeholder data.
