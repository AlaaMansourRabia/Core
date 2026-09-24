/**
 * Ensure content is accessible without hover on touch devices.
 */
import {
	HoverCard,
	HoverCardTrigger,
	HoverCardContent,
} from "@corensystem/coren-ui/hover-card";
import {Button} from "@corensystem/coren-ui/button";
import {Info} from "lucide-react";

export function MobileDo() {
	return (
		<div className="wwc:space-y-2">
			<div className="wwc:flex wwc:items-center wwc:gap-2">
				<span className="wwc:text-sm wwc:font-medium">Monthly cost: $49</span>
				<HoverCard>
					<HoverCardTrigger asChild>
						<Button
							variant="ghost"
							size="icon"
							className="wwc:h-6 wwc:w-6"
							aria-label="Pricing details"
						>
							<Info className="wwc:h-4 wwc:w-4" />
						</Button>
					</HoverCardTrigger>
					<HoverCardContent className="wwc:w-64">
						<p className="wwc:text-sm">Includes unlimited users and 100GB storage.</p>
					</HoverCardContent>
				</HoverCard>
			</div>
			{/* Same info available in main content for mobile */}
			<p className="wwc:text-xs wwc:text-muted-foreground">
				Includes unlimited users and 100GB storage
			</p>
		</div>
	);
}
