/**
 * Segmented control with disabled option.
 */
import {SegmentedControl} from "@corensystem/coren-ui/segmented-control";

export function Disabled() {
	return (
		<SegmentedControl
			value="on"
			options={[
				{value: "on", label: "On"},
				{value: "off", label: "Off"},
				{value: "auto", label: "Auto", disabled: true},
			]}
		/>
	);
}
