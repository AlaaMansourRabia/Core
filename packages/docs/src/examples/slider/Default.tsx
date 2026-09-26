/**
 * Default slider with single value.
 */
import {Slider} from "@corensystem/coren-ui/slider";

export function Default() {
	return <Slider defaultValue={[50]} max={100} step={1} className="wwc:w-[200px]" />;
}
