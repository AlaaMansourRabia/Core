/**
 * Avoid large or prominent triggers that suggest clickability.
 */
import {
	HoverCard,
	HoverCardTrigger,
	HoverCardContent,
} from "@corensystem/coren-ui/hover-card";

export function TriggerDont() {
	return (
		<HoverCard>
			<HoverCardTrigger asChild>
				{/* Large card-like trigger is misleading - looks clickable */}
				<div className="wwc:w-64 wwc:rounded-lg wwc:border wwc:p-4 wwc:cursor-pointer wwc:hover:bg-muted">
					<h3 className="wwc:font-semibold">Feature Overview</h3>
					<p className="wwc:text-sm wwc:text-muted-foreground">
						Hover for details
					</p>
				</div>
			</HoverCardTrigger>
			<HoverCardContent>
				<p className="wwc:text-sm">Feature description appears here.</p>
			</HoverCardContent>
		</HoverCard>
	);
}
