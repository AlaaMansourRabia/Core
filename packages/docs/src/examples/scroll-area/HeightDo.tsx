/**
 * Define explicit height for scroll areas.
 */
import {ScrollArea} from "@corensystem/coren-ui/scroll-area";

export function HeightDo() {
	return (
		<ScrollArea className="wwc:h-64 wwc:rounded-md wwc:border">
			<div className="wwc:p-4">
				<h4 className="wwc:mb-4 wwc:text-sm wwc:font-medium">Fixed Height</h4>
				{Array.from({length: 30}, (_, i) => (
					<div key={i} className="wwc:py-1 wwc:text-sm">
						Item {i + 1}
					</div>
				))}
			</div>
		</ScrollArea>
	);
}
