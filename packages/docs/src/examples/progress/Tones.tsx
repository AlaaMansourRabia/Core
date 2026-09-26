/**
 * Semantic color tones for progress states.
 */
import {Progress} from "@corensystem/coren-ui/progress";

export function Tones() {
	return (
		<div className="wwc:flex wwc:flex-col wwc:gap-4 wwc:w-[200px]">
			<div className="wwc:space-y-1">
				<span className="wwc:text-sm">Primary</span>
				<Progress value={75} tone="primary" />
			</div>
			<div className="wwc:space-y-1">
				<span className="wwc:text-sm">Success</span>
				<Progress value={100} tone="success" />
			</div>
			<div className="wwc:space-y-1">
				<span className="wwc:text-sm">Warning</span>
				<Progress value={50} tone="warning" />
			</div>
			<div className="wwc:space-y-1">
				<span className="wwc:text-sm">Danger</span>
				<Progress value={25} tone="danger" />
			</div>
		</div>
	);
}
