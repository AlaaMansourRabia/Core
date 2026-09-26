/**
 * Basic vertical scroll area.
 */
import {ScrollArea} from "@corensystem/coren-ui/scroll-area";

export function Default() {
	return (
		<ScrollArea className="wwc:h-48 wwc:w-64 wwc:rounded-md wwc:border">
			<div className="wwc:p-4">
				<h4 className="wwc:mb-4 wwc:text-sm wwc:font-medium">Tags</h4>
				{Array.from({length: 20}, (_, i) => (
					<div key={i} className="wwc:py-1 wwc:text-sm">
						Tag {i + 1}
					</div>
				))}
			</div>
		</ScrollArea>
	);
}
