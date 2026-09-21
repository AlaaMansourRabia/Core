# Heavy 3D assets policy

Some Storybook mockups (the reality-capture 3D views) need large binary assets — photogrammetry
meshes, fragments models, workers — that run to **hundreds of MB**. We deliberately do **not**:

- commit them to `core/Core` (every clone would balloon), or
- ship them inside the `@core/core-ui` npm package (every consumer would download them).

Instead they live in a separate **internal** repo and are pulled into the deployed Storybook at
deploy time.

## Where they live

**`core/core-3d-assets`** (visibility: **internal** — visible to core members, not public).
One folder per mockup; paths mirror how the Storybook serves them. See that repo's README to add more.

## How it reaches the deployed Storybook

The deployed Storybook is behind the DS's GitHub login. Before it builds, CI copies the assets into
`apps/storybook/public/` so they are served **same-origin, behind that same login** — the browser
never fetches them cross-origin from GitHub.

```
node scripts/fetch-3d-assets.mjs   # reads scripts/3d-assets.manifest.json, pulls into apps/storybook/public/
```

- Driven by `scripts/3d-assets.manifest.json` (repo path → `public/` path). Add a row per new asset set.
- Needs a **server-side** token with read access to the assets repo, as env `ASSETS_REPO_TOKEN`
  (never exposed to the browser).
- Non-fatal without the token: the DS still builds; the 3D views just show their "3D model unavailable"
  fallback. Set `REQUIRE_3D_ASSETS=1` on the real deploy to make a missing pull fail the build.

## CI setup (one-time — the part a maintainer must do)

1. **Create a token** with read access to `core/core-3d-assets` (a fine-grained PAT scoped to that
   repo with Contents: Read, or a GitHub App installation token). The default Actions `GITHUB_TOKEN` only
   sees the current repo, so it can't read the assets repo.
2. **Add it as a secret** on `core/Core` (or the org): `ASSETS_REPO_TOKEN`.
3. **Add a fetch step** to the Storybook deploy workflow, before the build:

   ```yaml
   - name: Fetch heavy 3D assets
     env:
       ASSETS_REPO_TOKEN: ${{ secrets.ASSETS_REPO_TOKEN }}
       REQUIRE_3D_ASSETS: "1"
     run: node scripts/fetch-3d-assets.mjs
   ```

## Local development

**Automatic (default).** `pnpm install` runs the fetch in its `postinstall`, so a fresh clone pulls the
assets with no extra step — as long as a token is available. The fetch resolves a token in this order:
`ASSETS_REPO_TOKEN` → `GITHUB_TOKEN` → **your local `gh` login** (`gh auth token`). So if you're signed into
the GitHub CLI with access to `core/core-3d-assets` (`gh auth login`), install "just works". The fetch
is idempotent (skips when the files are already present) and **never fails the install** — with no token it
logs and no-ops, and the 3D views fall back to their "unavailable" state.

To fetch (or re-fetch) manually at any time:

- `pnpm fetch:3d-assets` — uses the same token resolution (env or `gh`), or
- `ASSETS_REPO_TOKEN=<token> node scripts/fetch-3d-assets.mjs` to force a specific token, or
- clone `core/core-3d-assets` and copy/symlink each mockup folder into `apps/storybook/public/`
  (e.g. `apps/storybook/public/reality-mesh`, `apps/storybook/public/site-b.frag`, `apps/storybook/public/worker.mjs`).

Use `FORCE=1` to re-pull even when the files already exist. Without the assets, the 3D views render their
fallback — everything else works.

## Adding a new mockup's assets

1. Push the heavy files to `core/core-3d-assets` under a new mockup folder (see its README).
2. Add a row to `scripts/3d-assets.manifest.json` mapping the repo path to the `public/` path.
3. That's it — the deploy fetch step picks it up.

## Base-path caveat

The viewers reference assets by root-absolute paths (`/reality-mesh/…`, `/site-b.frag`, `/worker.mjs`).
If the Storybook is deployed under a sub-path (`SB_BASE=/storybook/`), make sure those assets are served
at that base (they are, because they sit in `apps/storybook/public/`, which Storybook serves under its base),
or pass explicit URLs via the viewer options (`tilesetUrl`, `dracoPath`, `workerUrl`, `fragUrl`, …).
