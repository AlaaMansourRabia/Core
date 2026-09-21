import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {CopyButton} from "@/components/ui/copy-button";
import {HealthView} from "@/components/ui/health-view";

export function HealthViewPage() {
	return (
		<div className="wwc:space-y-8">
			<div>
				<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
					<h1 className="wwc:text-3xl wwc:font-bold">HealthView</h1>
					<CopyButton
						value="HealthView"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:text-muted-foreground wwc:mt-2">
					Grouped rule findings, each naming the element that needs repairing.
				</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Default</CardTitle>
					<CardDescription>
						Every finding carries the element it points at, so the panel can jump the user to the thing that needs
						repairing rather than describing it. A finding with no single target is attributed to the ontology itself,
						which keeps every row actionable.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:h-[520px] wwc:overflow-auto wwc:rounded-lg wwc:border">
						<HealthView />
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
