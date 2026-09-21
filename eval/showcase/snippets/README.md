# Manual snippet drop-in

Drop `.tsx` snippets here to populate either column of the showcase, named:

```
<task>.A1.tsx   # fair baseline (package knowledge only)
<task>.A4.tsx   # full Core knowledge
```

Tasks (core-5): `side-panel`, `data-grid`, `transient-feedback`, `multi-step-form`, `destructive-action`.

Example: `side-panel.A1.tsx`.

Resolution order per (task, arm), first hit wins (see `../prepare.mjs`):

1. **this folder** — `snippets/<task>.<arm>.tsx`
2. captured A4 from the contracts pilot — `../results/runs/ablation-contracts-pilot-*/<task>.A4.r0.tsx`
3. captured "with" from the V2 run — `../results/runs/2026-*/<task>.with.tsx`

**A1 has no captures yet** — it resolves *only* from this folder, so add `*.A1.tsx` files here to
fill the left column. A snippet must export a renderable component (a default export, or a
PascalCase named export).

Files in this folder are committed (so a curated A1 example can ship); the resolved copies in
`../.generated/` and `node_modules/` are gitignored.
