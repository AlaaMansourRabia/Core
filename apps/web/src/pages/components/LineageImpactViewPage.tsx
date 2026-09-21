import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {CopyButton} from "@/components/ui/copy-button";
import {LineageImpactView} from "@/components/ui/lineage-impact-view";

export function LineageImpactViewPage() {
	return (
		<div className="wwc:space-y-8">
			<div>
				<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
					<h1 className="wwc:text-3xl wwc:font-bold">LineageImpactView</h1>
					<CopyButton
						value="LineageImpactView"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:text-muted-foreground wwc:mt-2">
					What-if blast radius across pipelines, processes and actions.
				</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Default</CardTitle>
					<CardDescription>
						A dependency list names the neighbours; this walks all three downstream registries and reports what a change
						actually reaches — the thing you want in front of you before a delete.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:h-[520px] wwc:overflow-auto wwc:rounded-lg wwc:border">
						<LineageImpactView />
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Deep linked</CardTitle>
					<CardDescription>A routed object-type id wins over the remembered one.</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:h-[520px] wwc:overflow-auto wwc:rounded-lg wwc:border">
						<LineageImpactView objectTypeId="ot_permit" />
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
