/**
 * Avoid OTP inputs without context or labels.
 */
import {InputOTP, InputOTPGroup, InputOTPSlot} from "@corensystem/coren-ui/input-otp";

export function LabelDont() {
	return (
		// No label, no instructions - user doesn't know what to enter
		<InputOTP maxLength={6}>
			<InputOTPGroup>
				<InputOTPSlot index={0} />
				<InputOTPSlot index={1} />
				<InputOTPSlot index={2} />
				<InputOTPSlot index={3} />
				<InputOTPSlot index={4} />
				<InputOTPSlot index={5} />
			</InputOTPGroup>
		</InputOTP>
	);
}
