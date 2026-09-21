# WakeCore Studio — Architecture

> **WakeCore is the source of truth for UI. AI editors do the work. Studio is the read‑only front door to WakeCore.**

Studio does not edit, does not converse, does not run an agent, and **does not reflect personal or unapproved edits.** It renders only what the WakeCore repository has already approved and published. Changes reach Studio through the normal contribution flow (commit → PR → review → merge → publish), never by watching a local workspace.

This document is the agreed architecture. Implementation follows the migration plan in §10.

---

## 1. First principles

- **WakeCore solves knowledge, not editing.** It knows templates, widgets, components, tokens, composition rules, validation, and governance. Products like Claude Code, Cursor, Codex, Windsurf, Lovable, Bolt, and v0 already solve editing well — WakeCore does not compete with them.
- **The WakeCore repository is the single source of truth.** Not the generated workspace, not the editor, not Studio's cache.
- **Studio is canonical and read‑only.** It visualizes the current, approved state of WakeCore and nothing else.
- **The workspace is a one‑way handoff.** Studio materializes it and launches an editor into it, then forgets it. The workspace's edits are private until promoted back into the repository.

Every decision below flows from these.

---

## 2. The three planes

```
┌──────────────────────────┐        ┌───────────────────────────┐        ┌──────────────────────────┐
│     WAKECORE STUDIO       │  read  │     WAKECORE REPOSITORY     │  PR   │    EXTERNAL WORKSPACE     │
│   (read‑only front door)  │◀───────│      (source of truth)      │◀──────│   (edit / run / propose)  │
│                           │  only  │                             │       │                          │
│  • Browse canonical       │        │  • templates / widgets      │       │  • experiment            │
│  • Preview canonical       │        │  • components / tokens      │       │  • edit in Claude Code   │
│  • Launch editor  ─────────┼────────┼─────────────────────────────┼──────▶│  • run locally           │
│  • Reflect approved change │        │  • manifests / knowledge    │       │  • commit / branch / PR  │
│  • NEVER show WIP edits    │        │  • Storybook state          │       │                          │
└──────────────────────────┘        └───────────────────────────┘        └──────────────────────────┘
        ▲                                      ▲                                      │
        │  renders current canonical           │  approved changes update canonical   │
        └──────────────────────────────────────┴──────────────────────────────────────┘
                         the ONLY path a change reaches Studio is through the repository
```

- **Studio → repository:** read‑only. Studio renders canonical artifacts.
- **Workspace → repository:** a proposal (commit/branch/PR), reviewed and approved like any contribution.
- **Studio ↛ workspace:** **there is no arrow.** Studio never reads, watches, iframes, or refreshes from a workspace.

The gap between "user edits" and "Studio shows it" is intentional — it *is* governance.

---

## 3. Responsibilities

| Plane | Owns | Never does |
|---|---|---|
| **WakeCore Studio** | browse, preview canonical artifacts, launch an editor into a fresh workspace | edit, converse, stream, run an agent, watch a workspace, display unapproved edits |
| **External workspace** | experimenting, editing, running, committing, proposing changes | is not Studio's truth; Studio does not depend on it |
| **WakeCore repository** | review, approve, promote, publish; hosts every canonical artifact | — |
| **Editor** (Claude/Cursor/…) | conversation, agent loop, editing, compiling, fixing, tools | owns no WakeCore knowledge (it *reads* what the workspace provides) |
| **WakeCore knowledge** (SDK/MCP/renderer) | templates, widgets, tokens, manifests, validation, **the renderer** | — |

---

## 4. User journey

```
Browse official template
      ↓
Preview official template          ← WakeCore renderer, read‑only, no disk written
      ↓
Edit in Claude Code                ← user commits to editing
      ↓
Pick a workspace location
      ↓
Materialize a separate workspace   ← src/ + .wakecore/ + editor config
      ↓
Launch Claude Code there           ← Studio hands off and steps out
      ↓
Work externally                    ← edit / run / iterate in the editor (Studio not involved)
      ↓
Commit / branch / PR               ← the normal contribution flow
      ↓
Review → approve → merge → publish ← canonical WakeCore updates
      ↓
Studio reflects the approved canonical change
```

Browsing writes nothing to disk. A workspace is born only when the user chooses to edit. After launch, the user's WIP lives in the editor and its own runtime — **not in Studio.**

---

## 5. Component diagram

```
┌──────────────────────────── STUDIO (runs locally) ─────────────────────────────┐
│  UI (browser)                     Local backend (Node)                          │
│  ┌───────────────┐                ┌────────────────────────────────────────┐    │
│  │ Home          │  GET /catalog  │ Catalog service                        │    │
│  │  search       │ ─────────────▶ │   reads CANONICAL repo data:           │    │
│  │  templates    │                │   library-index.json, manifests/,      │    │
│  │  recent (open │  POST /preview │   templates, tokens                    │    │
│  │   folder only)│ ─────────────▶ │ Preview service ─▶ WakeCore Renderer   │    │
│  ├───────────────┤                │   (canonical template → live view)     │    │
│  │ Preview page  │◀── render ─────┤                                        │    │
│  │  [canonical]  │                │ Workspace materializer ─▶ writes a      │    │
│  │  [Edit in ▾]  │  POST /materialize + /launch                            │    │
│  │               │ ─────────────▶ │ Editor registry ─▶ editor.prepare()    │    │
│  │               │                │                    editor.launch()  ───┼──┐ │
│  └───────────────┘                └────────────────────────────────────────┘  │ │
│         ▲ renders ONLY canonical                                              │ │
└─────────┼─────────────────────────────────────────────────────────────────────┼─┘
          │ reads (read-only)                                        launch()    │
   ┌──────┴───────────────┐                                    ┌─────────────────▼─┐
   │ WAKECORE REPOSITORY  │   approved changes (PR → merge)     │ EXTERNAL WORKSPACE│
   │ templates · widgets  │◀───────────────────────────────────│ Claude Code edits │
   │ tokens · manifests   │                                    │ src/  (private)   │
   │ SDK · MCP · renderer  │   reads .wakecore/ + MCP ─────────▶│ .wakecore/ (ctx)  │
   └──────────────────────┘                                    └───────────────────┘
```

Two seams only: **Studio → Editor** = `editor.launch(workspace)`; **Editor/workspace → WakeCore** = `.wakecore/` + SDK/MCP. Studio reads the repository; the workspace proposes to the repository; **Studio and the workspace never talk.**

---

## 6. Workspace structure (external — Studio writes it once, then never reads it back)

```
<workspace>/
  src/                      ← the editable app source (the editor owns this)
    page.tsx
  .wakecore/                ← canonical, editor-agnostic WakeCore context FOR THE EDITOR
    workspace.json          ← id, name, template id, created, schemaVersion
    template.json           ← snapshot of the source template's manifest
    page-instance.json      ← the WakeCore composition SEED + validation target (advisory)
    artifacts.json          ← locally generated candidates awaiting promotion (future)
  CLAUDE.md                 ← SMALL & STABLE: "use .wakecore/ + the WakeCore SDK & MCP"
  AGENTS.md                 ← same policy, cross-editor convention
  .mcp.json                 ← the wakecore MCP server
  .claude/settings.json     ← tool allowlist + permissions
  (package.json, vite.config.ts … only when we add Run/Export — see §11 Risk 3)
```

- **`.wakecore/` is context for the editor, not for Studio.** Studio writes it at materialize time and never reads it afterward.
- **`CLAUDE.md` stays ~15 lines and is never regenerated.** The *data* lives in `.wakecore/`; the *instructions* stay generic (point the AI at `.wakecore/` + SDK + MCP, reuse WakeCore, import from `@wakecap/core-ui/<kebab>`).
- `page-instance.json` is a **seed + validation target**, not live truth — the editor edits `src/`; `.wakecore/` is regenerated/validated via the SDK, never hand-authored (see §11 Risk 2).

---

## 7. Launch flow (a one‑way handoff)

```
click "Edit in Claude Code"
  └─▶ POST /api/workspace/materialize { templateId, location }
        1. mkdir <location>
        2. write src/ from the canonical template seed
        3. write .wakecore/ (workspace.json, template.json, page-instance.json)   ← from the SDK
        4. write generic CLAUDE.md / AGENTS.md / .mcp.json / .claude/settings.json
        5. editor = registry.get("claude")
        6. editor.prepare(workspace)     ← project .wakecore/ into THIS editor's config (idempotent)
        7. editor.launch(workspace)      ← ClaudeEditor: open a terminal → cd <ws> && claude
        8. append to recent-workspaces.json  (path + editor + timestamps — for reopening only)
  └─▶ Studio returns to the (canonical) Preview. No watcher. No iframe. No refresh-on-edit.
```

After step 8 Studio's involvement ends. It does **not** watch `<location>`, does **not** iframe a dev server, and does **not** refresh when files change there.

---

## 8. Editor abstraction

Studio never names an editor in its core; it depends on an interface.

```
interface Editor {
  id; label; isAvailable(): boolean
  prepare(workspace): void     // project .wakecore/ into THIS editor's expected config files
  launch(workspace): void      // open the editor on the workspace
}

ClaudeEditor  prepare → CLAUDE.md / .mcp.json / .claude/settings.json ; launch → terminal `claude`
CursorEditor  prepare → .cursor/rules/wakecore.mdc                    ; launch → `cursor <dir>`
CodexEditor   prepare → AGENTS.md                                     ; launch → terminal `codex`
GeminiEditor  prepare → …                                             ; launch → …
```

`.wakecore/` is the single canonical source; each `Editor.prepare()` translates it into that editor's format. New editors are added without changing the workspace schema. Studio only ever calls `editor.prepare(); editor.launch()`. `isAvailable()` gates the button; if the tool isn't on PATH the fallback is a **copyable `cd <ws> && <cmd>`** command — never a hard failure. All OS-specific terminal handling lives inside the `Editor` implementation.

---

## 9. How canonical updates reach Studio

Studio renders the **current** canonical state of the repository. It updates only when that canonical state changes — which happens exclusively through the contribution flow:

```
workspace edit → commit/branch/PR → review → approve → merge
             → regenerate canonical data (catalog / manifests / Storybook / templates)
             → Studio re-reads canonical data → new artifact appears in Studio
```

Studio's "refresh" therefore means **re-read the repository's canonical outputs** (`library-index.json`, `manifests/`, built templates, Storybook), not "watch a workspace." In local dev this is a catalog reload on repository change; in a published setting it follows the release of the WakeCore packages. **Unapproved edits never appear.**

---

## 10. What Studio must NOT do (explicit)

Removed from the architecture, permanently:

- ❌ embedded chat, message history, streaming UI
- ❌ agent runtime, tool execution, compile/repair loops, warm sessions, session persistence, CLI wrapper
- ❌ **workspace file watcher**
- ❌ **HMR back into Studio**
- ❌ **iframe of a workspace dev server**
- ❌ **"Refresh" as a response to local workspace edits**
- ❌ **Recent Workspaces previewing modified source** (the list stores path + editor + timestamps for *reopening/relaunching only*; it never renders workspace changes)
- ❌ any mechanism that makes Studio a live preview of personal or unapproved edits

---

## 11. Migration plan (today → this) + audit

Current Studio is ~1,400 lines, most of it the now-deleted embedded-agent layer.

- **Phase 1 — Amputate the agent.** Delete `server/agent.ts`, `/api/message`, `sendMessage`/`AgentEvent`, `lib/models.ts`, the chat rail, the compile→repair loop, warm sessions, attachment→CLI plumbing (~700 lines). Studio still browses + previews canonical templates.
- **Phase 2 — Split preview from workspace.** `/api/build` (which created a workspace and compiled) becomes **`/api/preview`** — render a canonical template with the WakeCore renderer, **no disk written**. The Preview page shows the running canonical template + one **Edit** action. No workspace yet.
- **Phase 3 — Workspace materializer + `.wakecore/` schema.** `server/workspace.ts` → materialize a real, external workspace *only on Edit*: `src/` + `.wakecore/` (versioned schemas) + thin editor config. Drop `sessionId`/`history`. Studio writes it and never reads it back.
- **Phase 4 — Editor abstraction + launcher.** `Editor` registry, `ClaudeEditor` (`prepare` + `launch` via terminal), `/api/workspace/materialize` + `/api/editor/launch`, a location picker, and a **Recent Workspaces** list (`name, template, path, lastOpened, lastModified`) used only to reopen the folder or relaunch the editor.
- **Phase 5 — Canonical reflect.** Studio reads current canonical repository data; a lightweight catalog reload picks up approved changes. No workspace watching.
- **Phase 6 — Future.** `Cursor/Codex/Gemini` editors; prompt entry (same launcher behind it); promotion tooling that helps turn a workspace into a PR; share/publish/git surfacing (`current editor`, `git branch`, `published`, `shared`) on Recent Workspaces.

**Audit against this architecture:**

| KEEP | REMOVE | SIMPLIFY | MOVE |
|---|---|---|---|
| Catalog (`server/catalog.ts`, `lib/catalog.ts`), `TemplateThumb`, Home grid/search, **the WakeCore renderer + esbuild compile as the canonical preview**, theme | `server/agent.ts`, `/api/message`, `sendMessage`+`AgentEvent`, `lib/models.ts`, the chat rail in `BuildScreen`, the repair loop, warm sessions, attachment→CLI plumbing, **any watcher / HMR / workspace-iframe / edit-refresh** | `Home.tsx` (drop chat composer/model/attachments → search + grid + recent), `App.tsx` (Home ↔ canonical Preview), `build.ts` (→ `/api/preview` only) | `server/workspace.ts` → workspace materializer (drop `sessionId`/`history`); the WakeCore-first **policy** → from agent spawn-flags into `.wakecore/` + a small stable `CLAUDE.md`; template seeds → workspace `src/` |

---

## 12. Risks & alternatives

**Risk 1 — the renderer boundary (now largely resolved).** Because Studio renders **only canonical templates** and never edited workspace code, the WakeCore renderer never has to represent arbitrary React. The earlier "preview silently lies about edited code" failure mode is gone by construction. Remaining nuance: the renderer must faithfully render *canonical* artifacts (templates/widgets/components) — that is squarely a WakeCore responsibility and already exists (the vendored renderer used by the current preview). ✅

**Risk 2 — `page-instance.json` vs code truth.** `src/page.tsx` is the working truth the *editor* owns; `.wakecore/page-instance.json` is a **seed + validation target**, regenerated/validated via the SDK and allowed to drift from code. Do not attempt a code↔instance round-trip — it keeps WakeCore *advisory* (its strength) and keeps governance sane (validation compares code against intent; it does not try to *be* the code).

**Risk 3 — don't scaffold a runnable app before it's needed.** Since Studio's preview is the WakeCore renderer (not the workspace's dev server), the workspace need not be independently runnable to exist. Materialize the **minimal** workspace first (`src/` + `.wakecore/` + editor config); make it a full runnable app only when we add **Run/Export**, and resolve `@wakecap/core-ui` via a shared/linked store rather than per-workspace installs. Keeps disk light and defers the dependency question.

**Risk 4 — "editor-agnostic" requires per-editor config generation.** Different editors read different files (`CLAUDE.md` / `.cursor/rules` / `AGENTS.md`). `.wakecore/` is canonical; each `Editor.prepare()` projects it into that editor's format at launch. This is what makes "tomorrow, another editor" actually true.

**Risk 5 — Studio is a local tool; state it and fail gracefully.** Launching an editor requires a local Node backend to open a terminal/app; a hosted Studio cannot. Treat "Studio runs on the user's machine" as an explicit assumption, gate the button on `isAvailable()`, and provide a copyable launch command as the fallback.

**Risk 6 — promotion latency is a feature, not a bug — but message it.** The user's WIP is invisible in Studio until merged; that is the canonical-integrity guarantee. To avoid confusion, the Preview/launch UX should say plainly: *"Editing happens in your editor; Studio shows official WakeCore. Your changes appear here after they're reviewed and merged."* The user watches their own progress in the editor's runtime, not in Studio.

**One thing not to change:** read‑only canonical Studio, preview‑before‑workspace, the tiny stable `CLAUDE.md`, `.wakecore/` as canonical metadata, and the one‑way handoff are the parts most likely to still make sense in five years. They make Studio small, make the repository the source of truth, and make the editor fully swappable.
