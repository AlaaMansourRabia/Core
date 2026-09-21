# Bundled typefaces

WakeCore self-hosts the three families its tokens declare, so `--font-sans`, `--font-mono` and
`--font-serif` resolve to the same computed family in every consumer — including offline, air-gapped
and CSP-restricted builds. Nothing here is fetched at runtime.

| Token | Family | Licence | Upstream |
|---|---|---|---|
| `--font-sans` | Figtree | SIL Open Font License 1.1 | <https://github.com/erikdkennedy/figtree> |
| `--font-mono` | IBM Plex Mono | SIL Open Font License 1.1 | <https://github.com/IBM/plex> |
| `--font-serif` | Lora | SIL Open Font License 1.1 | <https://github.com/cyrealtype/Lora-Cyrillic> |

All three are licensed under the **SIL Open Font License, Version 1.1**
(<https://openfontlicense.org>), which permits redistribution — including bundled inside another
package — provided the fonts are not sold on their own and the licence travels with them. This file
is that notice.

## What is bundled

WOFF2 only, **latin** and **latin-ext** subsets. Other subsets (cyrillic, greek, vietnamese) are
deliberately omitted: they would multiply the payload for scripts the product does not use, and text
in them falls back to the next family in the stack rather than failing.

Figtree and Lora are **variable** fonts — a single file spans the whole weight range. IBM Plex Mono is
not, so it ships one file per declared weight (400, 500, 600, plus italic 400).

## Regenerating

These files are vendored, not hand-placed. After changing which families or weights the tokens
declare:

```bash
node scripts/vendor-fonts.mjs
```

That downloads the WOFF2 files and rewrites `../fonts.css` to match. Do not edit `fonts.css` by hand.

## CSP

Self-hosting means no `font-src` allowance for a third-party host is required. The fonts are served
from wherever the consuming app serves its own assets, so a `font-src 'self'` policy is sufficient.
