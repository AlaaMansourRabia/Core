/**
 * Toggle group sizes.
 */
import {ToggleGroup, ToggleGroupItem} from "@corensystem/coren-ui/toggle-group";
import {Sun, Moon} from "lucide-react";

export function Sizes() {
	return (
		<div className="wwc:flex wwc:flex-col wwc:gap-4">
			<ToggleGroup type="single" size="sm" defaultValue="light">
				<ToggleGroupItem value="light" aria-label="Light">
					<Sun className="wwc:size-3" />
				</ToggleGroupItem>
				<ToggleGroupItem value="dark" aria-label="Dark">
					<Moon className="wwc:size-3" />
				</ToggleGroupItem>
			</ToggleGroup>
			<ToggleGroup type="single" size="default" defaultValue="light">
				<ToggleGroupItem value="light" aria-label="Light">
					<Sun className="wwc:size-4" />
				</ToggleGroupItem>
				<ToggleGroupItem value="dark" aria-label="Dark">
					<Moon className="wwc:size-4" />
				</ToggleGroupItem>
			</ToggleGroup>
			<ToggleGroup type="single" size="lg" defaultValue="light">
				<ToggleGroupItem value="light" aria-label="Light">
					<Sun className="wwc:size-5" />
				</ToggleGroupItem>
				<ToggleGroupItem value="dark" aria-label="Dark">
					<Moon className="wwc:size-5" />
				</ToggleGroupItem>
			</ToggleGroup>
		</div>
	);
}
