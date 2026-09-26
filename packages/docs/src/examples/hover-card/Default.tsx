import {Avatar} from "@corensystem/coren-ui/avatar";
import {Button} from "@corensystem/coren-ui/button";
/**
 * Basic hover card with user profile.
 */
import {HoverCard, HoverCardTrigger, HoverCardContent} from "@corensystem/coren-ui/hover-card";
import {CalendarDays} from "lucide-react";

export function Default() {
	return (
		<HoverCard>
			<HoverCardTrigger asChild>
				<Button variant="link">@corensystem</Button>
			</HoverCardTrigger>
			<HoverCardContent className="wwc:w-80">
				<div className="wwc:flex wwc:justify-between wwc:space-x-4">
					<Avatar>
						<div className="wwc:flex wwc:h-full wwc:w-full wwc:items-center wwc:justify-center wwc:bg-muted wwc:text-sm wwc:font-medium">
							CS
						</div>
					</Avatar>
					<div className="wwc:space-y-1">
						<h4 className="wwc:text-sm wwc:font-semibold">@corensystem</h4>
						<p className="wwc:text-sm">The Coren Design System – open source component library for React.</p>
						<div className="wwc:flex wwc:items-center wwc:pt-2">
							<CalendarDays className="wwc:mr-2 wwc:h-4 wwc:w-4 wwc:opacity-70" />
							<span className="wwc:text-xs wwc:text-muted-foreground">Joined December 2023</span>
						</div>
					</div>
				</div>
			</HoverCardContent>
		</HoverCard>
	);
}
