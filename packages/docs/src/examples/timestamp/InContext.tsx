/**
 * Timestamp used in a post or comment context.
 */
import {Timestamp} from "@corensystem/coren-ui/timestamp";

export function InContext() {
	const postDate = new Date(Date.now() - 7200000);
	return (
		<div className="wwc:flex wwc:items-center wwc:gap-2 wwc:text-sm">
			<span className="wwc:font-medium">John Doe</span>
			<span className="wwc:text-muted-foreground">·</span>
			<Timestamp date={postDate} />
		</div>
	);
}
