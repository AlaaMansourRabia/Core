/**
 * Scroll area with content constrained to viewport width.
 */
import {ScrollArea} from "@corensystem/coren-ui/scroll-area";

export function FitWidth() {
	return (
		<ScrollArea className="wwc:h-48 wwc:w-64 wwc:rounded-md wwc:border" fitWidth>
			<div className="wwc:p-4">
				<h4 className="wwc:mb-4 wwc:text-sm wwc:font-medium">Long Paths</h4>
				{Array.from({length: 10}, (_, i) => (
					<div key={i} className="wwc:py-1 wwc:text-sm wwc:truncate">
						/very/long/file/path/that/would/normally/overflow/item-{i + 1}.tsx
					</div>
				))}
			</div>
		</ScrollArea>
	);
}
