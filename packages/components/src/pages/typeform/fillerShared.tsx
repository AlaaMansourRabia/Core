import type {ReactNode} from "react";

// Shared chrome + result summary for the two engine-specific preview fillers (FillerRHF and
// FillerRJSF). Both wrap their engine-rendered form in <FillerShell> and, on submit, show the same
// <FillerEnding> — so the ONLY difference between the two previews is the form engine underneath.
// Answers are keyed by question id in both engines, so this file is engine-agnostic.
import {ArrowLeft, Check} from "lucide-react";

import {Badge} from "../../badge";
import {Button} from "../../button";
import {dataSourceByKey} from "./dataSources";
import type {FormSchema, Question} from "./model";

/** Human-readable rendering of one stored answer (handles both engines' value shapes). */
export function formatAnswer(q: Question, value: unknown): string {
	if (value == null || value === "") return "—";
	const labelFor = (v: unknown) => q.options?.find((o) => o.value === v)?.label ?? String(v);

	// Richer types first (some carry object/data-url values that shouldn't be String()'d).
	if (q.type === "signature") return "Signed";
	if (q.type === "attachment") return String(value);
	if (q.type === "derived_count") return String(value);
	if (q.type === "data_source_select") {
		const rec = dataSourceByKey(q.dataSource)?.records.find((r) => r.id === value);
		return rec?.label ?? String(value);
	}
	if (q.type === "matrix" || q.type === "gas_test_table") {
		// Count filled cells across the nested { row: { col: value } } structure.
		const rows = typeof value === "object" ? Object.values(value as Record<string, unknown>) : [];
		let filled = 0;
		for (const row of rows) {
			if (row && typeof row === "object") {
				filled += Object.values(row as Record<string, unknown>).filter((c) => c !== "" && c != null).length;
			}
		}
		return filled ? `${filled} cell${filled === 1 ? "" : "s"} filled` : "—";
	}

	if (Array.isArray(value)) {
		return value.length ? value.map(labelFor).join(", ") : "—";
	}
	if (value instanceof Date) {
		return Number.isNaN(value.getTime()) ? "—" : value.toLocaleDateString();
	}
	if (q.type === "date" && typeof value === "string") {
		const d = new Date(value);
		return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString();
	}
	if (q.type === "rating" && (typeof value === "number" || typeof value === "string")) {
		return `${value}/${q.max ?? 5}`;
	}
	if (q.type === "multiple_choice") return labelFor(value);
	return String(value);
}

/** Full-window shell: top bar with Exit + an engine badge, and a centered scrollable body. */
export function FillerShell({engine, onExit, children}: {engine: string; onExit: () => void; children: ReactNode}) {
	return (
		<div className="wwc:flex wwc:h-full wwc:min-h-0 wwc:w-full wwc:flex-col wwc:bg-background">
			<div className="wwc:flex wwc:shrink-0 wwc:items-center wwc:justify-between wwc:gap-3 wwc:border-b wwc:border-border wwc:px-4 wwc:py-3">
				<Button variant="ghost" size="sm" onClick={onExit}>
					<ArrowLeft className="wwc:size-4" />
					Exit preview
				</Button>
				<Badge variant="secondary">Powered by {engine}</Badge>
			</div>
			<div className="wwc:flex wwc:min-h-0 wwc:flex-1 wwc:justify-center wwc:overflow-y-auto wwc:p-6">
				<div className="wwc:w-full wwc:max-w-xl">{children}</div>
			</div>
		</div>
	);
}

/** The post-submit thank-you + per-question response summary, shared by both fillers. */
export function FillerEnding({
	schema,
	values,
	engine,
	onExit,
	onRestart,
}: {
	schema: FormSchema;
	values: Record<string, unknown>;
	engine: string;
	onExit: () => void;
	onRestart: () => void;
}) {
	return (
		<FillerShell engine={engine} onExit={onExit}>
			<div className="wwc:flex wwc:flex-col wwc:items-center wwc:gap-6 wwc:text-center">
				<div className="wwc:flex wwc:size-14 wwc:items-center wwc:justify-center wwc:rounded-full wwc:bg-primary wwc:text-primary-foreground">
					<Check className="wwc:size-7" />
				</div>
				<div className="wwc:flex wwc:flex-col wwc:gap-1">
					<h1 className="wwc:text-2xl wwc:font-semibold wwc:text-foreground">Thanks for completing {schema.title}</h1>
					<p className="wwc:text-sm wwc:text-muted-foreground">Your responses have been recorded.</p>
				</div>

				{schema.questions.length > 0 && (
					<dl className="wwc:flex wwc:w-full wwc:flex-col wwc:gap-3 wwc:text-left">
						{schema.questions.map((q, i) => (
							<div
								key={q.id}
								className="wwc:flex wwc:flex-col wwc:gap-0.5 wwc:rounded-md wwc:border wwc:border-border wwc:bg-card wwc:px-4 wwc:py-3"
							>
								<dt className="wwc:text-xs wwc:font-medium wwc:text-muted-foreground">
									{i + 1}. {q.label}
								</dt>
								<dd className="wwc:text-sm wwc:text-foreground">{formatAnswer(q, values[q.id])}</dd>
							</div>
						))}
					</dl>
				)}

				<div className="wwc:flex wwc:items-center wwc:gap-3">
					<Button variant="outline" onClick={onRestart}>
						Start over
					</Button>
					<Button onClick={onExit}>Back to editor</Button>
				</div>
			</div>
		</FillerShell>
	);
}
