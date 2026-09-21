# WakeCore ablation — which knowledge layer earns the lift

Pass-rate per arm (Wilson 95% CI). The **fair control is A1** (structural package facts a real developer has); A0 is the legacy information-starved reference only.

| Arm | structure     | compile    | render     | overall   |
| --- | ------------- | ---------- | ---------- | --------- |
| A1  | 17% [3–56]    | 17% [3–56] | 17% [3–56] | 0% [0–39] |
| A2  | 17% [3–56]    | 0% [0–39]  | 17% [3–56] | 0% [0–39] |
| A3  | 100% [61–100] | 17% [3–56] | 0% [0–39]  | 0% [0–39] |
| A4  | 100% [61–100] | 0% [0–39]  | 0% [0–39]  | 0% [0–39] |

## Incremental lift (percentage points, with the layer each step adds)

| Step                                       | structure | compile | render | overall |
| ------------------------------------------ | --------- | ------- | ------ | ------- |
| A1→A2 (**selection** (semantic catalog))   | +0        | -17     | +0     | +0      |
| A2→A3 (**composition** (skill+patterns))   | +83       | +17     | -17    | +0      |
| A3→A4 (**impl knowledge** (failure modes)) | +0        | -17     | +0     | +0      |

> Metrics: **structure** = the deterministic validators (component-choice / imports / provider-wiring / failure-mode, rolled up); **compile** = `tsc` against the real built `@wakecap/core-ui` types; **render** = render-smoke mount. **overall** = all three pass.
> render-smoke is a _server-render floor_ (mounts + non-empty markup); it does not run effects or browser-only APIs — full browser fidelity is a V3 follow-up.
> A claim is only supported when the lift's CI lower bound clears 0 (see `eval/V2-PLAN.md` §6).
