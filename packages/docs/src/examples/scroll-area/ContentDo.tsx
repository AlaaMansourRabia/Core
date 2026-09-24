/**
 * Add padding inside scroll area for content breathing room.
 */
import {ScrollArea} from "@corensystem/coren-ui/scroll-area";

export function ContentDo() {
	return (
		<ScrollArea className="wwc:h-32 wwc:w-64 wwc:rounded-md wwc:border">
			<div className="wwc:p-4 wwc:pr-6">
				{Array.from({length: 15}, (_, i) => (
					<div key={i} className="wwc:py-1 wwc:text-sm">
						Item {i + 1} with proper padding
					</div>
				))}
			</div>
		</ScrollArea>
	);
}
