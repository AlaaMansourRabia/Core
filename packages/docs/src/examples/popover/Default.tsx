/**
 * Basic popover with rich content.
 */
import {Popover, PopoverContent, PopoverTrigger} from "@corensystem/coren-ui/popover";
import {Button} from "@corensystem/coren-ui/button";

export function Default() {
	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button variant="outline">Open Popover</Button>
			</PopoverTrigger>
			<PopoverContent>
				<div className="wwc:grid wwc:gap-4">
					<div className="wwc:space-y-2">
						<h4 className="wwc:font-medium wwc:leading-none">Dimensions</h4>
						<p className="wwc:text-sm wwc:text-muted-foreground">
							Set the dimensions for the layer.
						</p>
					</div>
				</div>
			</PopoverContent>
		</Popover>
	);
}
