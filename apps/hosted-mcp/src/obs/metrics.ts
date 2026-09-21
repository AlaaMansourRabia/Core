// Metrics seam. Phase 1 keeps in-memory counters and exposes a snapshot; a Prometheus/OTel exporter
// drops in behind this same interface later without touching the capabilities or transports.

export interface Metrics {
	record(capability: string, sample: {elapsedMs: number; ok: boolean}): void;
	snapshot(): Record<string, {calls: number; errors: number; totalMs: number}>;
}

export function createMetrics(): Metrics {
	const table = new Map<string, {calls: number; errors: number; totalMs: number}>();
	return {
		record(capability, {elapsedMs, ok}) {
			const row = table.get(capability) ?? {calls: 0, errors: 0, totalMs: 0};
			row.calls += 1;
			row.totalMs += elapsedMs;
			if (!ok) row.errors += 1;
			table.set(capability, row);
		},
		snapshot() {
			return Object.fromEntries(table);
		},
	};
}
