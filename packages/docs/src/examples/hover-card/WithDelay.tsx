import {Badge} from "@corensystem/coren-ui/badge";
/**
 * Hover card with custom open and close delays.
 */
import {HoverCard, HoverCardTrigger, HoverCardContent} from "@corensystem/coren-ui/hover-card";
import {Info} from "lucide-react";

export function WithDelay() {
	return (
		<div className="wwc:flex wwc:items-center wwc:gap-2">
			<span className="wwc:text-sm">Feature status:</span>
			<HoverCard openDelay={200} closeDelay={100}>
				<HoverCardTrigger asChild>
					<Badge variant="secondary" className="wwc:cursor-help">
						Beta
						<Info className="wwc:ml-1 wwc:h-3 wwc:w-3" />
					</Badge>
				</HoverCardTrigger>
				<HoverCardContent className="wwc:w-72">
					<div className="wwc:space-y-2">
						<h4 className="wwc:font-semibold">Beta Feature</h4>
						<p className="wwc:text-sm wwc:text-muted-foreground">
							This feature is in beta testing. It may change or be removed in future releases. Report issues to help us
							improve.
						</p>
					</div>
				</HoverCardContent>
			</HoverCard>
		</div>
	);
}
