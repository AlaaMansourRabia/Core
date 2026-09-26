import {Button} from "@corensystem/coren-ui/button";
/**
 * Keep popover content focused and scannable.
 */
import {Popover, PopoverContent, PopoverTrigger} from "@corensystem/coren-ui/popover";

export function ContentDo() {
	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button variant="outline">View Status</Button>
			</PopoverTrigger>
			<PopoverContent className="wwc:w-auto">
				<div className="wwc:text-sm">
					<p className="wwc:font-medium">Build Status</p>
					<p className="wwc:text-green-600">Passed</p>
				</div>
			</PopoverContent>
		</Popover>
	);
}
