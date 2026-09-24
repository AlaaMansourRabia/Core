/**
 * Avoid scroll areas without defined height.
 */
import {ScrollArea} from "@corensystem/coren-ui/scroll-area";

export function HeightDont() {
	return (
		<ScrollArea className="wwc:rounded-md wwc:border">
			{/* No height defined - scroll area won't work properly */}
			<div className="wwc:p-4">
				<h4 className="wwc:mb-4 wwc:text-sm wwc:font-medium">No Height</h4>
				<p className="wwc:text-sm wwc:text-muted-foreground">
					Without a height constraint, the scroll area will just expand.
				</p>
			</div>
		</ScrollArea>
	);
}
