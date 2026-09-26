/**
 * Avoid hover-only popovers that aren't keyboard accessible.
 */
import {Popover, PopoverContent, PopoverTrigger} from "@corensystem/coren-ui/popover";

export function AccessibleDont() {
	return (
		<div className="wwc:relative wwc:inline-block">
			{/* Non-focusable trigger - keyboard users can't access */}
			<span className="wwc:text-sm wwc:underline wwc:cursor-help">
				Hover for info
			</span>
			<Popover>
				<PopoverTrigger className="wwc:absolute wwc:inset-0 wwc:opacity-0">
					trigger
				</PopoverTrigger>
				<PopoverContent>
					<p className="wwc:text-sm">Hidden trigger - not keyboard accessible.</p>
				</PopoverContent>
			</Popover>
		</div>
	);
}
