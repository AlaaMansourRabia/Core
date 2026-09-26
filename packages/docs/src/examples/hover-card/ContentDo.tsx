/**
 * Use hover cards for supplementary, non-essential information.
 */
import {
	HoverCard,
	HoverCardTrigger,
	HoverCardContent,
} from "@corensystem/coren-ui/hover-card";
import {Link} from "@corensystem/coren-ui/link";
import {ExternalLink} from "lucide-react";

export function ContentDo() {
	return (
		<p className="wwc:text-sm">
			Check out our{" "}
			<HoverCard>
				<HoverCardTrigger asChild>
					<Link href="#" className="wwc:text-primary wwc:underline">
						documentation
					</Link>
				</HoverCardTrigger>
				<HoverCardContent className="wwc:w-64">
					<div className="wwc:space-y-2">
						<h4 className="wwc:font-semibold wwc:flex wwc:items-center wwc:gap-1">
							Docs
							<ExternalLink className="wwc:h-3 wwc:w-3" />
						</h4>
						<p className="wwc:text-sm wwc:text-muted-foreground">
							Comprehensive guides, API references, and examples.
						</p>
					</div>
				</HoverCardContent>
			</HoverCard>{" "}
			for more details.
		</p>
	);
}
