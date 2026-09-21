# WakeCore ablation — which knowledge layer earns the lift

Pass-rate per arm (Wilson 95% CI). The **fair control is A1** (structural package facts a real developer has); A0 is the legacy information-starved reference only.

| Arm | structure     | compile     | render    | overall   |
| --- | ------------- | ----------- | --------- | --------- |
| A4  | 100% [85–100] | 43% [24–63] | 0% [0–15] | 0% [0–15] |
| A5  | 100% [85–100] | 52% [32–72] | 0% [0–15] | 0% [0–15] |

## Incremental lift (percentage points, with the layer each step adds)

| Step     | structure | compile | render | overall |
| -------- | --------- | ------- | ------ | ------- |
| A4→A5 () | +0        | +10     | +0     | +0      |

> Metrics: **structure** = the deterministic validators (component-choice / imports / provider-wiring / failure-mode, rolled up); **compile** = `tsc` against the real built `@wakecap/core-ui` types; **render** = render-smoke mount. **overall** = all three pass.
> render-smoke is a _server-render floor_ (mounts + non-empty markup); it does not run effects or browser-only APIs — full browser fidelity is a V3 follow-up.
> A claim is only supported when the lift's CI lower bound clears 0 (see `eval/V2-PLAN.md` §6).
