/**
 * A basic number input with stepper controls.
 */
import {NumberInput} from "@corensystem/coren-ui/number-input";
import * as React from "react";

export function Default() {
	const [value, setValue] = React.useState<number | undefined>(0);
	return <NumberInput value={value} onChange={setValue} className="wwc:w-[150px]" />;
}
