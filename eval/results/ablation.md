# WakeCore ablation — which knowledge layer earns the lift

Pass-rate per arm (Wilson 95% CI). The **fair control is A1** (structural package facts a real developer has); A0 is the legacy information-starved reference only.

| Arm | component-choice | imports | provider-wiring | failure-mode |
| --- | --- | --- | --- | --- |
| A1 | 83% [66–93] | 100% [89–100] | 100% [89–100] | 23% [12–41] |
| A2 | 97% [83–99] | 100% [89–100] | 100% [89–100] | 23% [12–41] |
| A3 | 100% [88–100] | 100% [88–100] | 100% [88–100] | 97% [83–99] |
| A4 | 100% [88–100] | 100% [88–100] | 100% [88–100] | 100% [88–100] |

## Incremental lift (percentage points, with the layer each step adds)

| Step | component-choice | imports | provider-wiring | failure-mode |
| --- | --- | --- | --- | --- |
| A1→A2 (**selection** (semantic catalog)) | +13 | +0 | +0 | +0 |
| A2→A3 (**composition** (skill+patterns)) | +3 | +0 | +0 | +73 |
| A3→A4 (**impl knowledge** (failure modes)) | +0 | +0 | +0 | +3 |

> Read **A1→A2** for selection value, **A2→A3** for composition, **A3→A4** for failure-mode avoidance. 
> A claim is only supported when the lift's CI lower bound clears 0 (see `eval/V2-PLAN.md` §6). 
> Graders are structural (do not yet verify compile/render) — V3 adds behavioral checks.
