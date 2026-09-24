import {Input} from "@corensystem/coren-ui/input";

/** DON'T: Avoid placeholder-only inputs without a visible label. Screen readers and users need persistent labels. */
export function BindDont() {
	return (
		<div className="wwc:grid wwc:w-full wwc:max-w-sm wwc:items-center wwc:gap-1.5">
			<Input id="label-bind-dont-email" type="email" placeholder="Email address" />
		</div>
	);
}
