/**
 * Avoid silent validation failures.
 */
import * as React from "react";
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSlot,
} from "@corensystem/coren-ui/input-otp";

export function FeedbackDont() {
	const [value, setValue] = React.useState("654321");

	return (
		<div className="wwc:space-y-3">
			<InputOTP maxLength={6} value={value} onChange={setValue}>
				<InputOTPGroup>
					<InputOTPSlot index={0} />
					<InputOTPSlot index={1} />
					<InputOTPSlot index={2} />
					<InputOTPSlot index={3} />
					<InputOTPSlot index={4} />
					<InputOTPSlot index={5} />
				</InputOTPGroup>
			</InputOTP>
			{/* No feedback when code is wrong - user left wondering */}
		</div>
	);
}
