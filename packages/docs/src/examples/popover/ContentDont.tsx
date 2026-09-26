import {Button} from "@corensystem/coren-ui/button";
import {Input} from "@corensystem/coren-ui/input";
/**
 * Avoid overloading popovers with too much content.
 */
import {Popover, PopoverContent, PopoverTrigger} from "@corensystem/coren-ui/popover";

export function ContentDont() {
	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button variant="outline">View Details</Button>
			</PopoverTrigger>
			<PopoverContent>
				<div className="wwc:space-y-4 wwc:text-sm">
					<p>Section 1 with lots of text...</p>
					<Input placeholder="Input 1" />
					<p>Section 2 with more text...</p>
					<Input placeholder="Input 2" />
					<p>Section 3 with even more...</p>
					<Input placeholder="Input 3" />
					<p className="wwc:text-muted-foreground">Too much content - consider a dialog instead.</p>
				</div>
			</PopoverContent>
		</Popover>
	);
}
