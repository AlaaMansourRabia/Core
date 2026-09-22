# Core Hub

The local dev launcher: one localhost (`http://localhost:4000`) that boots everything and puts each
surface behind a sidebar tab. Built from Core's own shell (`CoreAppSidebar` + `CoreAppTopBar`),
so it dogfoods the library it launches.

```bash
pnpm hub
```

| Tab              | Runs on         | How it's shown                                        |
| ---------------- | --------------- | ----------------------------------------------------- |
| Studio           | `:5001`         | embedded iframe                                       |
| Storybook        | `:6006`         | link (never iframed)                                  |
| Designers Hub    | `:5002`         | embedded iframe, sub-routes synced                    |
| WC3 Viewers      | `:5180`         | embedded iframe, opt-in (see below)                   |
| That Open SDK    | `:5301`–`:5303` | embedded iframe + source switcher, opt-in (see below) |
| Developer Access | —               | local page (MCP setup)                                |

This app is **local-only**. The deployed hub at `core.core.com` is `apps/web`, built by
`scripts/vercel-build.mjs`, which deliberately skips `apps/hub`.

Embedded URLs are env-overridable: `VITE_STUDIO_URL`, `VITE_STORYBOOK_URL`, `VITE_DESIGNER_URL`,
`VITE_WC3_SHELL_URL`, `VITE_TOC_EXAMPLES_URL`, `VITE_TOC_UI_URL`, `VITE_TOC_APP_URL`.

## WC3 Viewers (opt-in)

The 3D / BIM / geospatial spikes live in two separate repos and are **not** vendored into Core.
`apps/workspace-shell` in the viewer repo already navigates between the eight viewers (Framework Map,
That Open SDK, IFC-Lite, xeokit, CesiumJS, Site Reality, Work Packages, APS Reference), so the hub
embeds that one shell rather than a tab per viewer.

One-time setup — clone both repos **beside each other**, and beside your Core checkout:

```bash
git clone git@github.com:core/wc3-example-dataset.git
git clone git@github.com:core/wc3-engineering-viewer.git

cd wc3-example-dataset && git lfs install --local && git lfs pull   # models are LFS objects (~300 MB)

cd ../wc3-engineering-viewer
nvm use                                      # needs Node >=22.19
npm ci
npm run data:link -- ../wc3-example-dataset
cp .env.example .env.local
```

Then:

```bash
WC3=1 pnpm hub
```

Off by default because it's heavy — xeokit and Cesium build their model artifacts on first start
(~1 min). Without it, the WC3 Viewers tab shows a card with this command instead of a blank iframe.

Ports used: shell `5180`; viewers `5197`, `5198`, `5199`, `5205`/`5206`, `5207`, `5208`, `5273`;
APS `8972`.

Environment overrides:

- `WC3_DIR` — path to the viewer clone, if it isn't beside the Core checkout.
- `WC3_APS=1` — also start the APS Reference viewer. Excluded by default because it exits
  immediately without real `APS_CLIENT_ID` / `APS_CLIENT_SECRET` / `APS_*_URN` in the viewer repo's
  `.env.local`. (The hub starts each viewer as its own process rather than using the viewer repo's
  `npm run dev:all`, which tears down every sibling when one child dies.)

## That Open SDK (opt-in)

Upstream reference material from [github.com/ThatOpen](https://github.com/ThatOpen) — the SDK the WC3
viewers are built on. Served straight from their own dev servers so what you see is theirs, unedited.
The tab carries a three-way switcher:

| Source            | Port    | Repo                                                   |
| ----------------- | ------- | ------------------------------------------------------ |
| **SDK Examples**  | `:5301` | `engine_components` — a live example per capability    |
| **UI Components** | `:5302` | `engine_ui-components` — their BIM web component kit   |
| **BIM App**       | `:5303` | `engine_templates/vanilla`, scaffolded into `bim-app/` |

One-time setup — a `thatopen/` folder beside your Core checkout:

```bash
mkdir thatopen && cd thatopen
git clone https://github.com/ThatOpen/engine_components.git
git clone https://github.com/ThatOpen/engine_ui-components.git
git clone https://github.com/ThatOpen/engine_templates.git

# Yarn 3 ships in-repo, so there is nothing to install globally.
# build-libraries is NOT optional: the examples import @thatopen/components by package name, and
# those workspace packages resolve to dist/, which doesn't exist until they're built. Skip it and
# every example 500s with "Failed to resolve entry for package" — the index still lists them, so it
# looks like clicking a link does nothing.
(cd engine_components    && node .yarn/releases/yarn-3.2.1.cjs install && node .yarn/releases/yarn-3.2.1.cjs build-libraries)
(cd engine_ui-components && node .yarn/releases/yarn-3.2.1.cjs install && node .yarn/releases/yarn-3.2.1.cjs build-libraries)

# The template is a scaffolder, not a dev server — copy it out so the clone stays pristine.
cp -R engine_templates/templates/vanilla bim-app
(cd bim-app && mv _gitignore .gitignore && npm install)

# Give it something to open: the starter ships with no data at all.
ln -sfn ../../wc3-example-dataset/processed/models bim-app/public/models
```

Then:

```bash
TOC=1 pnpm hub          # or WC3=1 TOC=1 pnpm hub for everything
```

Ports are passed on the command line rather than written into the clones, so `git pull` in any of
them stays clean. Override the clone location with `TOC_DIR`.

Re-run `build-libraries` after pulling either engine repo, and restart the dev server afterwards —
Vite caches the failed package resolution for the life of the process, so a build alone won't fix an
already-running server.

Smoke-tested at time of writing: **37/37** SDK examples load clean. **38/42** UI examples do —
SheetBoard, Topics, Grid and Chart throw `Failed to execute 'createElement' on 'Document'` on load.
That's upstream, not a setup problem.

### The BIM App is a working copy, not a mirror

`thatopen/bim-app` is a scaffolded copy of the `vanilla` template and is meant to be edited — it's the
scratch surface for building experiences on the SDK. Two changes are already in it:

- `src/ui-templates/sections/models.ts` reads `/models/catalog.json` and renders a **WC3 sample models**
  list (VD2, VL4, DT3, TH1, DP1) that loads Fragments straight from the dataset. Upstream, the only way
  in is the `+` button's IFC / Fragments file pickers, so the app opens empty.
- `src/main.ts` frames the camera on each model as it loads, measured one animation frame after
  `fragments.core.update()` — the streamed geometry isn't in the scene graph before that, and an empty
  bounding box silently skips the fit. This matters because DP1, TH1 and VL4 are georeferenced: they sit
  at UTM coordinates ~2.3M units from the origin, so without a fit a successful load looks like an empty
  grid.

The dataset mixes two coordinate frames (see `coordinateFrames` in its catalog), so a georeferenced
model and a local-origin one are millions of units apart. Loading both is fine — the camera goes to
whichever loaded last — but no single view holds them together. That's the dataset, not the viewer.

### One local patch

`engine_ui-components/vite.config.ts` generates its examples index by globbing `packages/**` and
pulling the package name out with `/packages\\([^\\]+)/` — a backslash-only regex, so on macOS and
Linux nothing matches and the index renders empty. Changed locally to the cross-platform form
`engine_components` already uses:

```diff
-const packageNameMatch = directory.match(/packages\\([^\\]+)/);
+const packageNameMatch = directory.match(/packages[\\\/]([^\\\/]+)/);
```

Worth sending upstream. Until then, re-apply it after pulling that repo.
