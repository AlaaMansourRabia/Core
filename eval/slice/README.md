# Core vertical slice — the tracer bullet (working)

The smallest **real, runnable** end-to-end implementation of the Core flywheel. It is not a page
builder and not a widget library — it is proof that the architecture connects as one system. Runs
**offline, deterministically, with no Anthropic key and no cost.**

```bash
node eval/slice/run.mjs
```

## What it does (the full lifecycle, one command)

```
Task: "Show three key organization metrics across the top of a dashboard."

1. RETRIEVE      scan knowledge/ → relevant manifests + accepted learnings (by intent)
2-5. DECIDE      a deterministic agent turns retrieved knowledge → artifact selection → a
                 page.instance.json   (template + widgets, or ad-hoc raw components)
6. RENDER        instance → page snippet → SSR via the existing render grader (real markup)
7. EVALUATE      tier-selection · composition · config-valid · data-contract · render
8. CAPTURE       out/<arm>/page.instance.json + findings.json
9. LEARN         a failing run distills a candidate learning → stored
   VERIFY        re-run on HELD-OUT phrasing (different words, same intent), then accept
10. REUSE        the accepted learning is retrieved → the agent's decision changes → improvement
```

**Observed result (reproducible):**
```
tier-selection:  Arm A = FAIL  →  Arm B (held-out) = PASS
overall:         Arm A = FAIL  →  Arm B          = PASS
✅ Loop closed: a captured failure became a verified learning that changed the next build.
```

Arm A (no learning) assembles **raw `Card` components** — it renders fine (1048 chars of markup) but
fails `tier-selection`. The failure distills into the learning *"for dashboards, start from the
org-overview template + metric-card widget, not raw Cards."* On **held-out phrasing**, Arm B retrieves
that learning, selects the template tier, uses the `metric-card` widget, and passes.

## Files (everything required, nothing more)
- `knowledge/org-overview.manifest.json`, `knowledge/metric-card.manifest.json` — the two manifests (types).
- `widgets/MetricCard.tsx` — the one widget impl (composes real Card + Typography + Badge).
- `run.mjs` — the whole flywheel; retrieve / decide / render / evaluate / learn inlined as functions.
- `out/` (gitignored) — per-arm `page.instance.json` + `findings.json`.
- `knowledge/learnings/` (gitignored) — the learning the run writes, then reuses.

---

## What was learned while building

1. **The flywheel's central claim holds:** the *same* agent produced a *different* artifact selection
   purely because the retrieved knowledge changed. Knowledge→decision causality is real and the loop
   closes — that is the thing worth proving.
2. **The eval earns its place:** both arms *render*. Only `tier-selection` distinguishes them. "It
   renders" would have called both a success; the eval caught that Arm A didn't reuse the tier model.
   Structural correctness ≠ behavioral correctness ≠ tier reuse — three different things, and the
   slice shows the eval must measure the third.
3. **The first run did NOT close the loop — and that was the point.** The per-subsystem trace localized
   the break instantly (`Arm B → widgets=[]`): held-out phrasing missed the widget under flat
   token-overlap retrieval. A tracer bullet's value is finding the broken seam cheaply.
4. **Reuse was high:** the render grader and capture infra were used as-is; only ~5-line bespoke
   graders and a tiny retrieval/agent were new. The architecture's existing pieces did connect.

## Architectural assumptions that HELD
- **Type vs instance split** (manifests = types, `page.instance.json` = instance) — clean and correct.
- **Schema-first manifests** carried enough for an agent to select + configure + instantiate.
- **Validators/graders are reusable across contexts** (the render grader rendered an *instance*, not
  just a snippet, unchanged).
- **A learning, gated on a held-out re-run, can safely change behavior** — the governance model works.

## Architectural assumptions that FAILED (or need revision)
- **"Retrieval is one flat index query" is wrong.** Building it revealed retrieval is *two* operations:
  (a) **intent → entry artifact** (fuzzy text match — the genuinely hard part, and brittle here), and
  (b) **entry → its dependencies** (structural, trivial — read `requiredWidgets`). The fix that closed
  the loop was resolving the region's widget **structurally from the template**, not re-retrieving it
  by keyword. *Recommendation: the architecture doc should split "retrieval" into these two.*
- **No widget build/registry exists**, so the renderer had to **inline the widget's source** to render
  an instance. Fine for a tracer; a real system needs instances to reference widgets by `id` and a
  registry to resolve `id → impl`.
- **The "agent" is a deterministic function, not an LLM.** This slice proves the *rails* (seams +
  knowledge→decision causality + the loop), **not** that a real model behaves this way. That is the
  honest boundary of what this proves.

## What should change before scaling
1. **Split retrieval** into intent-match (entry selection) + structural resolution (dependencies). Make
   structural resolution the default once an artifact is chosen; invest the fuzzy-matching effort only
   in entry selection. *(This is the one finding worth folding back into the architecture doc.)*
2. **Build a widget registry + a general reference renderer** (`id → impl`), retiring source-inlining.
3. **Swap the deterministic agent for a real LLM** and re-confirm the loop closes with a real model —
   this is where the first genuine API spend belongs, and the real test of decision *quality*.
4. **Promote the learning store to a real lifecycle** (candidate → held-out-verified → accepted →
   decay/retire), with provenance + dedup, and the held-out gate enforced by the eval automatically
   (here it was scripted by hand).
5. **Generalize the bespoke graders** into the tier-parameterized grader library the architecture
   envisions (`selection`/`composition`/`config`/`data-contract`/behavioral per tier).

## The honest verdict
The Core architecture **works as one connected system** — a real failure became verified knowledge
that measurably changed the next build, end to end, offline. The model didn't need to change; it needed
**one refinement** (retrieval = intent-match + structural resolution) that building the slice surfaced.
Everything else is scaling, not rethinking.
