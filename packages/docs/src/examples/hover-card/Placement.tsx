import {Button} from "@corensystem/coren-ui/button";
/**
 * Hover card with different placement positions.
 */
import {HoverCard, HoverCardTrigger, HoverCardContent} from "@corensystem/coren-ui/hover-card";

export function Placement() {
	return (
		<div className="wwc:flex wwc:items-center wwc:gap-8">
			<HoverCard>
				<HoverCardTrigger asChild>
					<Button variant="outline">Top</Button>
				</HoverCardTrigger>
				<HoverCardContent side="top" className="wwc:w-48">
					<p className="wwc:text-sm">Content appears above the trigger.</p>
				</HoverCardContent>
			</HoverCard>

			<HoverCard>
				<HoverCardTrigger asChild>
					<Button variant="outline">Right</Button>
				</HoverCardTrigger>
				<HoverCardContent side="right" className="wwc:w-48">
					<p className="wwc:text-sm">Content appears to the right.</p>
				</HoverCardContent>
			</HoverCard>

			<HoverCard>
				<HoverCardTrigger asChild>
					<Button variant="outline">Bottom</Button>
				</HoverCardTrigger>
				<HoverCardContent side="bottom" className="wwc:w-48">
					<p className="wwc:text-sm">Content appears below the trigger.</p>
				</HoverCardContent>
			</HoverCard>

			<HoverCard>
				<HoverCardTrigger asChild>
					<Button variant="outline">Left</Button>
				</HoverCardTrigger>
				<HoverCardContent side="left" className="wwc:w-48">
					<p className="wwc:text-sm">Content appears to the left.</p>
				</HoverCardContent>
			</HoverCard>
		</div>
	);
}
