import {Button} from "@corensystem/coren-ui/button";
import {Input} from "@corensystem/coren-ui/input";
import {Label} from "@corensystem/coren-ui/label";
/**
 * Popover containing form elements.
 */
import {Popover, PopoverContent, PopoverTrigger} from "@corensystem/coren-ui/popover";

export function WithForm() {
	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button variant="outline">Update Settings</Button>
			</PopoverTrigger>
			<PopoverContent className="wwc:w-80">
				<div className="wwc:grid wwc:gap-4">
					<div className="wwc:grid wwc:gap-2">
						<Label htmlFor="popover-width">Width</Label>
						<Input id="popover-width" defaultValue="100%" />
					</div>
					<div className="wwc:grid wwc:gap-2">
						<Label htmlFor="popover-height">Height</Label>
						<Input id="popover-height" defaultValue="auto" />
					</div>
				</div>
			</PopoverContent>
		</Popover>
	);
}
