/**
 * Scroll area with custom scrollbar styling.
 */
import {ScrollArea} from "@corensystem/coren-ui/scroll-area";

export function CustomScrollbar() {
	return (
		<ScrollArea
			className="wwc:h-48 wwc:w-64 wwc:rounded-md wwc:border"
			scrollbarClassName="wwc:w-1.5"
			thumbClassName="wwc:bg-primary/50"
		>
			<div className="wwc:p-4">
				<h4 className="wwc:mb-4 wwc:text-sm wwc:font-medium">Custom Scrollbar</h4>
				{Array.from({length: 20}, (_, i) => (
					<div key={i} className="wwc:py-1 wwc:text-sm">
						Item {i + 1}
					</div>
				))}
			</div>
		</ScrollArea>
	);
}
