# Capture — standalone prototype

The Capture app, pulled out of the Wakecore template system so it can be worked on in
isolation. It is a plain Vite + React + TypeScript app that renders `<Capture />` directly
(no Designer Hub, no template viewer), consuming the design system from `@wakecap/core-ui`.

## Run

From the repo root:

```bash
pnpm --filter capture-prototype dev      # http://localhost:5180
```

Or from this folder: `pnpm dev`.

## Layout

```
prototypes/capture/
  src/
    Capture.tsx             # the app shell + tabs (Site, Analytics, Workers List, …) — edit this
    blueprint-navigator.tsx # the Site tab's blueprint workspace (Blueprint Navigator) — edit this
    main.tsx                # mounts <Capture /> in a TooltipProvider
    index.css              # tokens + wwc-prefixed Tailwind (same recipe as apps/web)
```

`Capture.tsx` and `blueprint-navigator.tsx` are local, editable copies. Everything else
(buttons, tables, canvas navigator, week selector, …) is imported from `@wakecap/core-ui`
as a black box, so edits to those files hot-reload instantly — no library rebuild needed.

## Styling note

These files use the internal `wwc:` Tailwind prefix (the library's convention). `index.css`
compiles `wwc:`-prefixed Tailwind via `@wakecap/core-tokens` and `@source`-scans the library
source, so the prefixed classes resolve exactly as they do inside Wakecore.

## Moving back into Wakecore later

To promote this back to a library template: copy `Capture.tsx` to
`packages/components/src/pages/core-capture.tsx`, switch the `@wakecap/core-ui/*` imports back
to relative (`../button`, …) and `./blueprint-navigator` back to `./core-blueprint-navigator`,
and re-register it (already wired at `manifests/capture.template.json`, the package export, and
the apps/web template registry).
