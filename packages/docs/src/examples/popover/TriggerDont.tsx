/**
 * Avoid invisible or unclear popover triggers.
 */
import {Popover, PopoverContent, PopoverTrigger} from "@corensystem/coren-ui/popover";

export function TriggerDont() {
	return (
		<Popover>
			<PopoverTrigger className="wwc:text-sm wwc:cursor-pointer">hover here maybe?</PopoverTrigger>
			<PopoverContent className="wwc:w-auto">
				<p className="wwc:text-sm">Unclear trigger - no visual affordance.</p>
			</PopoverContent>
		</Popover>
	);
}
