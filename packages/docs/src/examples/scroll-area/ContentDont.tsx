/**
 * Avoid content touching scrollbar.
 */
import {ScrollArea} from "@corensystem/coren-ui/scroll-area";

export function ContentDont() {
	return (
		<ScrollArea className="wwc:h-32 wwc:w-64 wwc:rounded-md wwc:border">
			<div>
				{Array.from({length: 15}, (_, i) => (
					<div key={i} className="wwc:py-1 wwc:text-sm">
						Item {i + 1} too close to edge
					</div>
				))}
			</div>
		</ScrollArea>
	);
}
