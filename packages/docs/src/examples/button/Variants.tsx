/**
 * All button variants for different semantic purposes.
 */
import {Button} from "@corensystem/coren-ui/button";

export function Variants() {
	return (
		<div className="wwc:flex wwc:flex-wrap wwc:gap-3">
			<Button variant="default">Default</Button>
			<Button variant="secondary">Secondary</Button>
			<Button variant="destructive">Destructive</Button>
			<Button variant="outline">Outline</Button>
			<Button variant="ghost">Ghost</Button>
			<Button variant="link">Link</Button>
		</div>
	);
}
