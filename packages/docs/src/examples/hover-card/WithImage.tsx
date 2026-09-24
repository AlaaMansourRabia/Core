/**
 * Hover card with preview image.
 */
import {
	HoverCard,
	HoverCardTrigger,
	HoverCardContent,
} from "@corensystem/coren-ui/hover-card";
import {Link} from "@corensystem/coren-ui/link";

export function WithImage() {
	return (
		<HoverCard>
			<HoverCardTrigger asChild>
				<Link href="#" className="wwc:text-primary wwc:underline">
					View dashboard screenshot
				</Link>
			</HoverCardTrigger>
			<HoverCardContent className="wwc:w-96 wwc:p-0">
				<div className="wwc:aspect-video wwc:bg-gradient-to-br wwc:from-primary/20 wwc:to-primary/5 wwc:flex wwc:items-center wwc:justify-center">
					<span className="wwc:text-sm wwc:text-muted-foreground">
						Dashboard Preview
					</span>
				</div>
				<div className="wwc:p-4">
					<h4 className="wwc:font-semibold">Analytics Dashboard</h4>
					<p className="wwc:text-sm wwc:text-muted-foreground wwc:mt-1">
						Real-time metrics and performance insights
					</p>
				</div>
			</HoverCardContent>
		</HoverCard>
	);
}
