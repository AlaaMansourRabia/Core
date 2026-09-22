import {ObjectAnalysisView} from "@corensystem/core-ui/pages/wc3-analysis-object-view";
import {seedAnalysisSession, type Wc3AnalysisSession} from "@corensystem/core-ui/pages/wc3-analysis-views";
import * as React from "react";

import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {CopyButton} from "@/components/ui/copy-button";

function Example() {
	const [session, setSession] = React.useState<Wc3AnalysisSession>(() => seedAnalysisSession());
	return (
		<div className="wwc:h-[560px] wwc:overflow-auto wwc:rounded-lg wwc:border">
			<ObjectAnalysisView session={session} onSessionChange={setSession} />
		</div>
	);
}

export function AnalysisWorkbenchPage() {
	return (
		<div className="wwc:space-y-8">
			<div>
				<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
					<h1 className="wwc:text-3xl wwc:font-bold">AnalysisWorkbench</h1>
					<CopyButton
						value="AnalysisWorkbench"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:text-muted-foreground wwc:mt-2">
					Stage-path query builder — source, filter, traverse, derive — with a route badge, a spec summary and a named
					diagnosis for every empty result.
				</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Object analysis</CardTitle>
					<CardDescription>
						Driven through <code>ObjectAnalysisView</code>, the thin real caller that supplies the two stage slots.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Example />
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Empty results are named</CardTitle>
					<CardDescription>
						An empty result reports <code>source-empty</code>, <code>no-time-column</code>,
						<code> filters-excluded-all</code> or <code>all-unlinked</code> rather than showing a blank chart, so the
						user learns which stage discarded their rows.
					</CardDescription>
				</CardHeader>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Two render slots, not a mode branch</CardTitle>
					<CardDescription>
						<code>renderSourceConfig</code> and <code>renderTraverseConfig</code> are exactly the two stages whose
						options differ between object and data analysis. Everything else is identical in both modes, which is why
						they are slots rather than a branch inside the widget.
					</CardDescription>
				</CardHeader>
			</Card>
		</div>
	);
}
