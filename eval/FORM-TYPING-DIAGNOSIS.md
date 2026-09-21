# Form / react-hook-form typing failure — engineering diagnosis

> ⛔ **CORRECTION (post-verification, 2026-06-23): the root-cause conclusion below was WRONG.**
> After restoring the build tooling and rebuilding, the `typeof FormProvider` source annotation
> made **no difference** — the dts bundler emits the same arrow signature regardless. The real
> cause was a **react-hook-form duplicate type identity in the eval grader**: the snippet (at repo
> root) and `@core/core-ui`'s bundled `.d.ts` resolved react-hook-form to *different paths*
> (symlink vs `.pnpm` realpath), which a real consumer app (one RHF) never hits. Deduping
> react-hook-form in the grader (`eval/graders/compile.mjs`, `paths` mapping) makes the Form
> generations compile **with the current arrow type** — 8 flips, 0 regressions, A5 52% → 76%.
> So: Core's `Form` type is **fine for real consumers**; this was a **measurement artifact**,
> not a library bug. The source annotation was reverted (no-op). The narrative below is retained
> for the record but its "Core Form typing" verdict is superseded by this correction.

> Diagnosis + options only. No implementation. Question: would fixing this materially increase
> compile success? (Original estimate; see correction above.)

## Verdict

`<Form {...form}>` fails `tsc` because **Core's build re-emits react-hook-form's `FormProvider`
with a degraded type signature**, not because of a version mismatch or duplicate package. The
source is a direct re-assignment (`const Form = FormProvider`), but the `.d.mts` bundler inlined
it as a generic *arrow signature*, which TS infers worse in JSX than the original generic
*function declaration*.

## 1. Exact failure trace

Minimal repro (`<Form {...useForm<{name:string}>()}>`) → **TS2322**:

```
Type '{ children…; watch: UseFormWatch<{ name: string }>; … }'
  is not assignable to type 'UseFormReturn<{ name?: string }, any, { name: string }>'.
  Types of property 'setValue' are incompatible.
    UseFormSetValue<{ name: string }> is not assignable to UseFormSetValue<{ name?: string }>.
```

The tell: the form object is `{ name: string }`, but `<Form>` infers its field-values generic as
**`{ name?: string }`** (partial). Because `setValue`/`control` use the field-values type
contravariantly, the concrete `{name:string}` form object is rejected. Same error on
`FormField control={form.control}` (TS2322 on `Control<…>`).

## 2. Root cause — candidates tested

| Candidate | Verdict | Evidence |
|---|---|---|
| react-hook-form **version mismatch** | ❌ ruled out | Exactly one RHF installed: **7.71.1**. |
| **duplicate type instances** | ❌ ruled out | `react-hook-form` resolves to the **same physical package** from both repo root and `packages/components`. |
| **Core Form typing** | ✅ **confirmed (root cause)** | Raw `<FormProvider {...form}>` from the *same* RHF **compiles**; Core's `<Form {...form}>` **fails**. Source is `const Form = FormProvider`, but the emitted `.d.mts` is `declare const Form: <TFieldValues, TContext=any, TTransformedValues=TFieldValues>(props: FormProviderProps<…>) => JSX.Element` — an inlined **arrow** generic, where RHF's original is a generic **function declaration**. TS JSX inference is weaker on the arrow form → infers the partial field-values type. |
| **missing exports** | ⚠️ contributing | `@core/core-ui/form` exports `useFormField` but **not `useForm`**, so consumers must `import { useForm } from "react-hook-form"` — outside the core-ui surface. It does not *cause* the type error (same RHF), but removes any chance for Core to ship a matching `useForm`. |
| other packaging (React 18.3.1 vs 19 split) | ❌ not this error | Real, but orthogonal — this failure is purely RHF generics, no React types involved. |

**Mechanism:** the dts bundler (tsdown / rollup-plugin-dts) flattened `FormProvider` into a
`const … : <generics>(props) => JSX.Element` instead of preserving `typeof FormProvider` (a
function declaration). The inlined arrow signature is structurally "equal" but infers
differently under JSX generic inference, collapsing the field-values type to its partial form.

## 3. Impact — how many failures

From the captured A5 pilot run (n=21, fully auditable):
- **6 / 21 generations (29%)** are gated by this Form type error (all `multi-step-form` + `validated-form`).
- **5 of those 6 fail ONLY on Form** — they would compile if Form were fixed. (1 `multi-step-form` generation has additional hallucinated-export errors.)
- A5 compile today **11/21 (52%)** → with Form fixed, **≈ 16/21 (76%)** — a **+24-point** single-fix lift.

This is larger than the entire contracts layer's effect (+10) and is the dominant remaining
compile blocker on form-bearing screens (forms are common in real Core product UIs).

## 4. Fix options (smallest first)

| # | Fix | Effort | Risk | Notes |
|---|---|---|---|---|
| **A (recommended)** | Annotate the source so the emitted type is preserved: `const Form: typeof FormProvider = FormProvider;` (or `export { FormProvider as Form }`). Rebuild, re-run the repro. | **1 line + rebuild** | very low | Forces the `.d.mts` to emit `typeof FormProvider` instead of the degraded arrow signature. Directly targets the root cause; no API/behavior change. |
| B | Configure the dts bundler to not inline external (`react-hook-form`) types — keep them as imports. | config | low | Fixes the class of problem (any re-exported external generic), but broader/риskier than A. |
| C | Also export a typed `useForm` from `@core/core-ui/form`. | small | low | Ergonomics + keeps agents on the core-ui import surface; complements A, doesn't replace it. |
| D | Loosen `Form`'s prop type to `FormProviderProps<any>`. | small | **high** | Removes the type error by removing type safety. Not recommended. |

**Recommended: A (+ C for ergonomics).** A is the smallest change that addresses the actual
cause; verify by re-running the minimal repro and re-grading the 6 form-gated pilot generations.

## 5. Does fixing it materially increase compile success? — Yes

- Pilot: **52% → ~76% compile** from this one fix (the 5 Form-only generations flip).
- It unblocks the most common real UI shape (forms), and is a **library correctness fix**, not a
  knowledge-layer workaround — so the benefit accrues to every consumer, not just the eval.
- Recommended sequence: land fix A → re-grade the captured pilot generations (free, offline) to
  confirm the 5 flip → only then consider a larger k or the next blocker (hallucinated exports).

## Not done here
No code changed. This is diagnosis + options; the fix (A) lives in `packages/components/src/form.tsx`
+ a rebuild, to be approved separately.
