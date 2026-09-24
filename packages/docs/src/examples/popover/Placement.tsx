/**
 * Popover with different placement positions.
 */
import {Popover, PopoverContent, PopoverTrigger} from "@corensystem/coren-ui/popover";
import {Button} from "@corensystem/coren-ui/button";

export function Placement() {
	return (
		<div className="wwc:flex wwc:flex-wrap wwc:gap-2">
			<Popover>
				<PopoverTrigger asChild>
					<Button variant="outline">Top</Button>
				</PopoverTrigger>
				<PopoverContent side="top" className="wwc:w-auto">
					<p className="wwc:text-sm">Popover on top</p>
				</PopoverContent>
			</Popover>
			<Popover>
				<PopoverTrigger asChild>
					<Button variant="outline">Bottom</Button>
				</PopoverTrigger>
				<PopoverContent side="bottom" className="wwc:w-auto">
					<p className="wwc:text-sm">Popover on bottom</p>
				</PopoverContent>
			</Popover>
			<Popover>
				<PopoverTrigger asChild>
					<Button variant="outline">Left</Button>
				</PopoverTrigger>
				<PopoverContent side="left" className="wwc:w-auto">
					<p className="wwc:text-sm">Popover on left</p>
				</PopoverContent>
			</Popover>
			<Popover>
				<PopoverTrigger asChild>
					<Button variant="outline">Right</Button>
				</PopoverTrigger>
				<PopoverContent side="right" className="wwc:w-auto">
					<p className="wwc:text-sm">Popover on right</p>
				</PopoverContent>
			</Popover>
		</div>
	);
}
