import {Button} from "@corensystem/coren-ui/button";
/**
 * Use clear trigger affordances for popovers.
 */
import {Popover, PopoverContent, PopoverTrigger} from "@corensystem/coren-ui/popover";
import {Info} from "lucide-react";

export function TriggerDo() {
	return (
		<div className="wwc:flex wwc:items-center wwc:gap-2">
			<span>API Rate Limit</span>
			<Popover>
				<PopoverTrigger asChild>
					<Button variant="ghost" size="sm" className="wwc:h-6 wwc:w-6 wwc:p-0">
						<Info className="wwc:h-4 wwc:w-4" />
						<span className="wwc:sr-only">More info</span>
					</Button>
				</PopoverTrigger>
				<PopoverContent className="wwc:w-auto">
					<p className="wwc:text-sm">1000 requests per minute</p>
				</PopoverContent>
			</Popover>
		</div>
	);
}
