/**
 * Ensure popovers are keyboard accessible.
 */
import {Popover, PopoverContent, PopoverTrigger} from "@corensystem/coren-ui/popover";
import {Button} from "@corensystem/coren-ui/button";

export function AccessibleDo() {
	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button variant="outline" aria-label="View account details">
					Account Info
				</Button>
			</PopoverTrigger>
			<PopoverContent>
				<div className="wwc:space-y-2">
					<p className="wwc:text-sm wwc:font-medium">Account Details</p>
					<p className="wwc:text-sm wwc:text-muted-foreground">
						Plan: Professional
					</p>
					<p className="wwc:text-sm wwc:text-muted-foreground">
						Status: Active
					</p>
				</div>
			</PopoverContent>
		</Popover>
	);
}
