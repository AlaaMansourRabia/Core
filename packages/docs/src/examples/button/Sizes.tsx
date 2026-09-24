/**
 * Available button sizes.
 */
import {Button} from "@corensystem/coren-ui/button";

export function Sizes() {
	return (
		<div className="wwc:flex wwc:items-center wwc:gap-3">
			<Button size="sm">Small</Button>
			<Button size="default">Default</Button>
			<Button size="lg">Large</Button>
		</div>
	);
}
