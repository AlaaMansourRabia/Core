/**
 * Avoid hiding essential information only in hover cards.
 */
import {
	HoverCard,
	HoverCardTrigger,
	HoverCardContent,
} from "@corensystem/coren-ui/hover-card";
import {Info} from "lucide-react";

export function MobileDont() {
	return (
		<div className="wwc:flex wwc:items-center wwc:gap-2">
			<span className="wwc:text-sm wwc:font-medium">Monthly cost: $49</span>
			<HoverCard>
				<HoverCardTrigger>
					<Info className="wwc:h-4 wwc:w-4 wwc:text-muted-foreground" />
				</HoverCardTrigger>
				<HoverCardContent className="wwc:w-64">
					{/* Essential pricing info only visible on hover - bad for mobile */}
					<p className="wwc:text-sm">
						<strong>Warning:</strong> Price increases to $99/month after trial.
					</p>
				</HoverCardContent>
			</HoverCard>
		</div>
	);
}
