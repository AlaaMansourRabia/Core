# Scenario Forge — live build map + generation pipeline

A standalone visualization of the scenario build: every scenario branch as a mindmap that fills in
live as scenarios get generated — with a real generation pipeline and a wireframe-review gate.

## Run
    cd scenario-forge && node server.mjs        # http://localhost:5273
    open http://localhost:5273/dashboard.html

`server.mjs` is a tiny dependency-free Node backend that serves the dashboard AND drives generation
(a static file server can't write state back, which the review gate needs).

## The pipeline
Toolbar **▶ Run generation** kicks it off. Each scenario moves through a real state machine, written
into `plan.json`, which the dashboard polls and reflects live:

    pending → running (wireframe) → review → approved → building → built

- **approved** = wireframe signed off (Approve in the review modal). Not in the product yet.
- **built** = a real, NATIVE, removable flow now lives in the target app. Toolbar
  **⚙ Build into product (N)** runs the **`scenario-forge` skill** (via your `claude` CLI) against the
  app for each approved scenario: it adds the flow under `src/scenario/` + minimal `// scenario-forge:flow`
  edits, verifies with `pnpm typecheck` (one fix-retry), and then `{target.mountUrl}?scenario={id}`
  renders it **natively inside the app** (real shell + the scenario state). This is the skill in action —
  the dashboard is just the interface. `target` (root / mountUrl) is configurable in `plan.json`; point
  `root` at another project to build into it.

### Removable — the whole point
Every build is reversible without touching the tool or the skill:
- A **flow safe-point** (`scenario-forge/.flow-safepoint.tgz`) snapshots the app's `src/` before the
  first flow. Generated code is namespaced under `src/scenario/`; edits to existing files are minimal
  and `// scenario-forge:flow`-marked.
- Toolbar **🧹 Remove flows** (or `bash scenario-forge/restore-flows.sh`) restores `src/` from the
  safe-point — removing every flow — and leaves `scenario-forge/` and `~/.claude/skills/scenario-forge`
  intact. Re-run the build to make new flows. (See the skill's `reference/removability.md`.)

### Referencing other wireframes in review chat
In the review modal's chat, the **Reference** chips (below the header) list the other scenarios on the
same screen; click one to mention it. Claude gets every same-screen wireframe as context, so
"make this match the admin one" works — it can read and copy from the sibling wireframe.

- **Wireframe stage.** For every scenario the runner writes `wireframes/{id}.html` — a schematic mock
  of that scenario's page (ladder-aware: blueprint / schematic-squares / unpriced-table / empty /
  read-only …). This is the review artifact.
- **Review gate.** Each scenario stops at `review`. Open its card → the drawer shows the wireframe in
  an iframe with **✓ Approve & build** / **✗ Request changes**. Toolbar **✓ Approve all (N)** clears
  them in one go; **Request changes** sends a scenario back to `pending`.
- **Skip reviews.** The toolbar **Skip reviews** switch (persisted server-side in `plan.settings.reviewMode`)
  bypasses the gate: `pending → running → done`. Turning it on also auto-approves anything already in review.
- **Reset** returns every generated scenario to `pending` (your designed ones are untouched).

### Consolidated review + collaborate with Claude
Toolbar **🔍 Review (N)** opens one modal you page through (**← Prev · ✗ Reject · ✓ Approve · Next →**,
progress dots, `A`/`R`/arrow keys). Each scenario shows its full-size wireframe + a description, plus:
- **Ask & shape (chat).** A chat panel powered by your `claude` CLI (`claude -p`, your subscription).
  Ask questions about the direction, or ask it to change the wireframe — e.g. *"add an amber banner
  and grey out the amount column"*. Claude edits the wireframe HTML and the iframe reloads with the
  change. (Each message is one real Claude call — it costs against your subscription and takes ~20-40s.)
- **Version history.** Every edit is a new version. The bar above the wireframe (`◀ v2 / 2 · current ▶`)
  steps through history; on an older version, **Restore this version** makes it current again.
- Chat + versions persist per scenario in `reviews/{id}.json`. **Approve** builds from the current version.

### API (what the buttons call)
`POST /api/run · /api/approve {id} · /api/reject {id} · /api/approve-all · /api/settings {reviewMode} · /api/reset`
`POST /api/chat {id,message} · /api/revert {id,v}` · `GET /api/review?id= · /api/version?id=&v=`
Chat requires the `claude` CLI on PATH (it is, in Claude Code).

### plan.json
Source of truth: one entry per scenario with `status`
(existing = designed by you | pending | running | review | done | error) + optional `step`, `wireframe`,
`thumb`. Plus `settings.reviewMode` (review | skip) and the `app` deep-link config.

> The wireframe stage is deterministic (templated from scenario metadata), so it runs with no LLM. The
> actual product build after approval is the code-building agent step — it consumes approved wireframes
> and replaces each `wireframe` with a real page + `thumb` screenshot.

## Open a scenario
Each card (and the detail drawer) has an **Open ↗** button that deep-links to the running prototype
at that scenario's state. The link is `{app.baseUrl}{app.linkPattern}` from `plan.json` — default
`http://localhost:5180?scenario={id}` (patterns: `{id}`, `{screen}`, `{role}`, `{caseType}`).
Enabled only for `app.openableStatuses` (default: existing + done); disabled while a scenario is
still queued/building. For the link to land on the exact state, the app at `baseUrl` must be running
and honor the `?scenario=` param — that param→state handling lives in the scenario harness the
generator (re)builds; it is not present while the flows are removed.

## Thumbnails
Cards for built scenarios (existing / done) show a page preview at the top; the **🖼 Thumbnails**
toolbar button shows/hides them all (persisted in localStorage). Source per scenario:
- if `scenario.thumb` is set (an image path/URL the generator writes after rendering the page), that
  screenshot is shown;
- otherwise a schematic SVG preview keyed to the screen type is drawn (badged "preview").
So the slot is meaningful now and upgrades to real screenshots later with no dashboard change — the
generator just needs to drop a `thumbs/{id}.png` and set `scenario.thumb`.

**Real screenshots** of the existing pages were captured by driving the running prototype (:5180)
with Playwright — see `capture-thumbs.mjs` (run from the malabo repo root:
`node prototypes/capture/scenario-forge/capture-thumbs.mjs`). It navigates the app to each screen and
saves `thumbs/{screen}.png`. Re-run it (or extend it per scenario id) once new scenario pages are
built to replace their schematic previews with real captures.

## Seams for later
- The detail drawer still carries a disabled **Phase 2** stub: pause a branch and add specific
  instructions while other scenarios keep building.

## Remove
    kill $(lsof -ti:5273); rm -rf scenario-forge    # the whole feature — nothing else is touched
