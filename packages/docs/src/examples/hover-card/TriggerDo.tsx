/**
 * Use inline text triggers that don't disrupt flow.
 */
import {HoverCard, HoverCardTrigger, HoverCardContent} from "@corensystem/coren-ui/hover-card";

export function TriggerDo() {
	return (
		<p className="wwc:text-sm wwc:leading-relaxed">
			The{" "}
			<HoverCard>
				<HoverCardTrigger asChild>
					<span className="wwc:cursor-help wwc:border-b wwc:border-dashed wwc:border-muted-foreground">
						API rate limit
					</span>
				</HoverCardTrigger>
				<HoverCardContent className="wwc:w-64">
					<p className="wwc:text-sm">1,000 requests per minute for free tier, 10,000 for Pro.</p>
				</HoverCardContent>
			</HoverCard>{" "}
			ensures fair usage across all users while maintaining system performance.
		</p>
	);
}
