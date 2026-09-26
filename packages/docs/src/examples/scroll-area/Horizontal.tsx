/**
 * Horizontal scroll area for wide content.
 */
import {ScrollArea, ScrollBar} from "@corensystem/coren-ui/scroll-area";

export function Horizontal() {
	return (
		<ScrollArea className="wwc:w-96 wwc:whitespace-nowrap wwc:rounded-md wwc:border">
			<div className="wwc:flex wwc:p-4 wwc:gap-4">
				{Array.from({length: 10}, (_, i) => (
					<div
						key={i}
						className="wwc:shrink-0 wwc:w-32 wwc:h-32 wwc:rounded-md wwc:bg-muted wwc:flex wwc:items-center wwc:justify-center"
					>
						Item {i + 1}
					</div>
				))}
			</div>
			<ScrollBar orientation="horizontal" />
		</ScrollArea>
	);
}
