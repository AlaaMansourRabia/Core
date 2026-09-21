# Prop/type contract layer — architecture & pilot plan

> Design only. Goal: decide whether per-component **prop/type contracts** close the compile gap
> the V3 pilot exposed — agents pick the right component and wire it (structure → 100%) but get
> **props/types wrong** (compile → ~0%). No authoring of all 118 components; a 6-component pilot
> that *proves or disproves* the lift first.

## 1. Why this, from the diagnosis

The compile failures that **survive full knowledge (A4)** are all *invalid-prop / wrong-type*:
`size="icon"` on Button, `searchValue`/`onSearchChange` on the wrong component, `watch` on Form,
echarts `grid` object type, `activeStep` on Stepper. The knowledge layer today carries
`intent` / `when` / `chooseOver` / `requires` / `variants` — *which* component and *how to wire
it* — but **not the prop signatures**. So the model guesses the API. Contracts give it the API.

## 2. Schema (per component)

```jsonc
{
  "component": "Button",
  "import": "@wakecap/core-ui/button",

  // --- GENERATED from the .d.ts (source of truth = TypeScript types) ---
  "props": {
    "variant": { "type": "enum", "values": ["default","destructive","outline","secondary","ghost","link"], "required": false, "default": "default" },
    "size":    { "type": "enum", "values": ["default","sm","lg"], "required": false, "default": "default" },
    "asChild": { "type": "boolean", "required": false },
    "onClick": { "type": "function", "required": false }
    // …plus inherited native <button> attributes (summarized, not exhaustively listed)
  },
  "requiredProps": [],

  // --- HAND-AUTHORED overlay (judgment, not derivable) ---
  "forbiddenProps": [],                       // props agents invent that don't exist
  "commonMistakes": [
    { "wrong": "size=\"icon\"", "why": "Button sizes are default|sm|lg; there is no \"icon\" size.", "right": "Use variant=\"ghost\" with an icon child (icon buttons), or size=\"sm\"." }
  ],
  "minimalExample": "import { Button } from \"@wakecap/core-ui/button\";\n<Button variant=\"destructive\">Delete</Button>"
}
```

Field roles:
- `props` / `requiredProps` — **generated** from `.d.ts`; never drift from the real types.
- `forbiddenProps` / `commonMistakes` / `minimalExample` — **hand-authored**, small, derived from
  *observed* failures (the capture instrumentation now records these automatically for future runs).

## 3. Where it lives — decision

| Option | Verdict |
|---|---|
| All in `library-index.json` | ❌ It's hand-authored *semantic* knowledge (intent/when). 118× full prop tables would bloat it and **drift** from the types. |
| `SKILL.md` | ❌ Narrative for reading, not a machine-readable lookup the grader/agent can index by component. |
| **Generated `component-api.json`** (props/variants/required from `.d.ts`) | ✅ Mechanical, regenerable, single source of truth = the types. Extend the existing `scripts/extract-component-catalog.mjs` (it already pulls `variants`/`sizes` from CVA). |
| **Thin hand-authored overlay** (`forbiddenProps`/`commonMistakes`/`minimalExample`) | ✅ Small, reviewable. Add as fields on `library-index.json` entries (sits with semantics) **or** a sibling `component-contracts.json`. |

**Recommendation:** two files, joined by component name —
1. `component-api.json` — **generated** from `.d.ts` (props, enums, required). Regenerate in the same step as `catalog-structural.json`.
2. overlay fields in `library-index.json` (`forbiddenProps`, `commonMistakes`, `minimalExample`) — hand-authored.

Rationale: keep the *mechanical, regenerable* part out of the hand-authored catalog so it never drifts and never needs human edits; keep the *judgment* part tiny and next to the existing semantics. Inject the **generated API into the A1 structural digest** (it's a public package fact a developer reads from `.d.ts` — fair-baseline-appropriate) and the **mistakes/examples overlay alongside A2/A4** knowledge.

## 4. Example contracts (2 of the 6, to make it concrete)

**Form family** (the highest-frequency compile offender):
```jsonc
{
  "component": "Form",
  "import": "@wakecap/core-ui/form",
  "props": { "...": "spreads a react-hook-form form object: <Form {...form}>" },
  "requiredProps": ["the spread form object from useForm()"],
  "forbiddenProps": ["watch"],   // agents put react-hook-form methods on <Form>; they belong on the form object
  "commonMistakes": [
    { "wrong": "<Form watch={...}>", "why": "<Form> is the provider; it takes the spread form object, not individual RHF methods.", "right": "const form = useForm(); <Form {...form}> … </Form>" },
    { "wrong": "FormControl without FormItem", "why": "useFormField() needs FormItem context.", "right": "<FormField …><FormItem><FormControl>…</FormControl></FormItem></FormField>" }
  ],
  "minimalExample": "<Form {...form}><FormField control={form.control} name=\"x\" render={({field})=>(<FormItem><FormControl><Input {...field}/></FormControl><FormMessage/></FormItem>)}/></Form>"
}
```

**Stepper** (the V3 render signal):
```jsonc
{
  "component": "Stepper",
  "import": "@wakecap/core-ui/stepper",
  "commonMistakes": [
    { "wrong": "<Stepper activeStep={n}>", "why": "Unknown prop forwarded to a DOM node (React warns / it no-ops).", "right": "<check the real Stepper prop for current step from component-api.json>" }
  ]
}
```

## 5. Pilot — does it move compile?

**Scope:** author contracts for exactly the 6 components that dominate the observed compile failures:
`Button`, `Form`/`FormField`/`FormControl`/`FormItem`, `DataTable`, `Stepper`, `Chart`, `Sheet`/`Dialog`.

**Design — one new arm, controlled A/B:**
- Add arm **A5 = A4 + the 6 contracts** injected into the system prompt.
- Compare **A4 vs A5** only (not the whole ladder) — isolates the contract layer's effect.

**Tasks (reuse existing — no new authoring):** a curated set that exercises all 6 —
| Component | Task(s) |
|---|---|
| Form family, Stepper | `multi-step-form` (V3) |
| Chart, Card | `dashboard-composition` (V3) |
| Button | `destructive-action`, `button-as-link` (V2) |
| DataTable | `data-grid` (V2) |
| Sheet | `side-panel` (V2); Dialog | `template-gallery` (V2) |

**Run:** A4 vs A5 × ~7 tasks × k=5, with the new capture on. ~70 calls.

**Success criteria (pre-registered):**
1. **compile pass-rate lift A4→A5 with Wilson CI lower bound > 0** — the headline.
2. **Capture-level proof:** the specific `invalid-prop` tsc diagnostics (e.g. `size="icon"`, `watch` on Form) **disappear** in A5 vs A4 — a mechanism check, not just a number.
3. **No structure regression** (A5 structure stays ≈100%).
4. Render is *not* a success gate here — it's still gated by the SSR/tooling artifacts (see the root-cause analysis); browser-render grading is the separate fix.

**Cost:** ~70 calls, caching on → **~$15–20**.

**Decision rule:** if (1)+(2) hold → generate `component-api.json` for all 118 from `.d.ts` and author overlays for the next tranche of compile-offenders. If the lift is flat → the gap is model-level (can't follow contracts) or grader-level, and we redirect (e.g. structured-output constraints, or fewer claims about compile).

## 6. What this plan does NOT do
No contracts for all 118 yet; no generator built yet; no enforcement; no new tasks; no live run. This
is the architecture + a falsifiable 6-component pilot. Author the 6 contracts + add arm A5 only on your go.
