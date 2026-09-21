---
name: core-compose
description: |
  Build the UI ONLY from Core. Consult the Core MCP server to choose a template and widgets,
  generate a validated PageInstance, and render it with the Core renderer. Never invent components,
  layouts, or arbitrary React/HTML.
triggers:
  - "core"
  - "core"
  - "operations dashboard"
  - "internal tool"
od:
  mode: prototype
  category: design-system
---

# Core Compose

Core is the **source of truth** for this UI. You are not designing from scratch — you are
**assembling a screen from Core's templates and widgets** and rendering it with Core. A
`core` MCP server is connected; it is the only correct way to decide what to build.

## Execute immediately — this skill overrides the default workflow

When this skill is active, **do not** run discovery, ask the user questions, present direction
options, propose visual concepts, or plan in prose first. On your **first turn**, immediately execute
the Core workflow below: call the `core` MCP tools and write `index.html`. The user's prompt
is the intent — pass it to `resolve_template`. Produce the artifact, then give a one-line summary.
There is no design freedom here beyond choosing the right Core template and widgets.

## Absolute rules

1. **Never invent UI.** Do not write bespoke components, layouts, Tailwind, or hand-authored React/HTML
   for the page content. The page must come from Core.
2. **The page is produced ONLY by `generate_page_instance`.** Do not hand-edit the returned PageInstance.
3. Your final artifact is a single `index.html` that renders that PageInstance with the Core
   renderer (wrapper below). That is the entire deliverable.

## Workflow (call these MCP tools, in order)

1. `resolve_template({ intent })` — pass the user's request. Pick the top candidate whose purpose fits
   (prefer higher score / a base template). Note its `id`.
   - You may call `list_templates()` first to browse what Core can build.
2. `resolve_widgets({ template_id })` — optional; see which widgets each region declares.
3. `generate_page_instance({ template_id, fill: "recommended" })` — returns `{ page, validation, unresolved, rationale }`.
   `page` is a `page-instance/0.1` object.
4. Look at `validation`. If there are blocking **errors** you can resolve by placing a widget the
   template declares for an empty region, call `generate_page_instance` again with
   `widgets: [{ widget, region }]`. A few advisory **warnings** (unbound inputs, not-yet-widgetized
   regions) are expected — proceed.
5. Emit the `index.html` artifact using the wrapper below, with `page` inlined verbatim as `PAGE`.

## Render wrapper (emit exactly this, substituting PAGE)

Write `index.html` with this content. Replace the `PAGE` value with the `page` object returned by
`generate_page_instance` (paste the JSON verbatim). Change nothing else.

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="stylesheet" href="http://localhost:8787/core-render.css" />
    <style>html,body{margin:0;height:100%;background:#fff}#root{min-height:100%}</style>
  </head>
  <body>
    <div id="root"></div>
    <script src="http://localhost:8787/core-render.js"></script>
    <script>
      const PAGE = /* paste the `page` object from generate_page_instance here */;
      window.Core.render(PAGE, document.getElementById("root"));
    </script>
  </body>
</html>
```

## Also write `core.json` (the decision record)

Alongside `index.html`, write a file named `core.json` capturing what Core decided, so Studio's
info panel can explain the screen. Fill it from the tool results (do not invent fields):

```json
{
  "template": { "id": "<template id>", "name": "<template name>", "rationale": "<why this template — from resolve_template>" },
  "widgets": [ { "widget": "<WidgetName>", "region": "<region id>" } ],
  "validation": {
    "buildable": true,
    "summary": { "errors": 0, "warnings": 0 },
    "issues": [ { "level": "error|warning", "message": "<message>", "fix": "<fix>" } ]
  },
  "trace": [
    { "tool": "resolve_template", "summary": "<one line>" },
    { "tool": "generate_page_instance", "summary": "<one line>" }
  ]
}
```

- `template`, `widgets` come from `generate_page_instance`; `validation` is its `validation` field; `trace`
  is the ordered list of Core tools you called with a one-line summary each.

## What "done" looks like

- You called `resolve_template` and `generate_page_instance`.
- `index.html` renders the returned PageInstance via `window.Core.render`.
- `core.json` records the template, widgets, validation, and decision trace.
- In your summary, state the template id and the widgets that were placed, and surface any validation
  warnings honestly (do not pretend the page is complete if Core says a region is empty).
