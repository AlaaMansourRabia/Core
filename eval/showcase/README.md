# WakeCore Showcase Viewer (local-only)

A local visual comparison tool: render **A1 (package-only baseline)** next to **A4 (full WakeCore
knowledge)** for the same task, in a real browser with WakeCore theming. **No Anthropic calls, no
API key, no paid evals** — it only reads `.tsx` snippets already on disk (captured runs or manual
drop-ins).

## Run it

One-time install of the viewer's toolchain (standalone, like `playground/tw4`):

```bash
npm --prefix eval/showcase install
```

Then, from the repo root:

```bash
pnpm showcase
```

This runs `prepare.mjs` (resolves snippets → gitignored `.generated/`, writes the manifest) and
starts Vite. Open the printed URL.

## Where snippets come from

Per task and arm (A1 / A4), first hit wins:

1. **Manual drop-in** — `eval/showcase/snippets/<task>.<arm>.tsx` (see that folder's README)
2. **Captured A4** — newest `eval/results/runs/ablation-contracts-pilot-*/<task>.A4.r0.tsx`
3. **Captured "with" (≈A4)** — newest `eval/results/runs/2026-*/<task>.with.tsx`

**A1 is never auto-found** (no A1 captures exist yet) — drop `*.A1.tsx` files in `snippets/` to fill
the left column. The A4 column auto-populates from existing captures.

## Scope

Core-5 only: `side-panel`, `data-grid`, `transient-feedback`, `multi-step-form`, `destructive-action`.
The viewer shows, per task: title, user-goal prompt, A1 + A4 previews, expected visible differences,
the encoded decision, source file paths, and run metadata when available. Snippets that fail to
render show the error in-panel (an honest outcome) rather than crashing the page.

> This is a visual example tool, not statistical proof. Aggregate evidence: `eval/EVIDENCE.md`.

## What's committed vs not

Committed: the viewer app, `tasks.json`, `prepare.mjs`, and any curated `snippets/*.tsx`.
Gitignored (local artifacts): `node_modules/`, `.generated/`, `runs/`, `dist/`, `package-lock.json`.
