/**
 * Controlled popover with external state.
 */
import * as React from "react";
import {Popover, PopoverContent, PopoverTrigger} from "@corensystem/coren-ui/popover";
import {Button} from "@corensystem/coren-ui/button";

export function Controlled() {
	const [open, setOpen] = React.useState(false);

	return (
		<div className="wwc:flex wwc:gap-2">
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<Button variant="outline">Toggle Popover</Button>
				</PopoverTrigger>
				<PopoverContent>
					<p className="wwc:text-sm">Controlled popover content.</p>
					<Button
						variant="outline"
						size="sm"
						className="wwc:mt-2"
						onClick={() => setOpen(false)}
					>
						Close
					</Button>
				</PopoverContent>
			</Popover>
			<Button variant="ghost" onClick={() => setOpen(!open)}>
				External Toggle
			</Button>
		</div>
	);
}
