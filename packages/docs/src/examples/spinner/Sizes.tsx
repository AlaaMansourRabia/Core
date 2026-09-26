/**
 * Spinners come in four sizes: sm, default, lg, and xl.
 */
import {Spinner} from "@corensystem/coren-ui/spinner";

export function Sizes() {
	return (
		<div className="wwc:flex wwc:items-center wwc:gap-4">
			<Spinner size="sm" />
			<Spinner size="default" />
			<Spinner size="lg" />
			<Spinner size="xl" />
		</div>
	);
}
