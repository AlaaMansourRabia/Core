/**
 * Disabled slider state.
 */
import {Slider} from "@corensystem/coren-ui/slider";

export function Disabled() {
	return <Slider defaultValue={[50]} max={100} disabled className="wwc:w-[200px]" />;
}
