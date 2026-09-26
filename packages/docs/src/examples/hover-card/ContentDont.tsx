/**
 * Avoid using hover cards for critical actions or information.
 */
import {
	HoverCard,
	HoverCardTrigger,
	HoverCardContent,
} from "@corensystem/coren-ui/hover-card";
import {Button} from "@corensystem/coren-ui/button";

export function ContentDont() {
	return (
		<HoverCard>
			<HoverCardTrigger asChild>
				<Button variant="destructive">Delete Account</Button>
			</HoverCardTrigger>
			<HoverCardContent className="wwc:w-72">
				{/* Critical confirmation should use Dialog, not HoverCard */}
				<div className="wwc:space-y-3">
					<p className="wwc:text-sm">
						Are you sure? This will permanently delete your account.
					</p>
					<div className="wwc:flex wwc:gap-2">
						<Button size="sm" variant="destructive">
							Confirm Delete
						</Button>
						<Button size="sm" variant="outline">
							Cancel
						</Button>
					</div>
				</div>
			</HoverCardContent>
		</HoverCard>
	);
}
