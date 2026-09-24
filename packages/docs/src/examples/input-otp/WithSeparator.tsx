/**
 * OTP input with separator between groups.
 */
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSlot,
	InputOTPSeparator,
} from "@corensystem/coren-ui/input-otp";

export function WithSeparator() {
	return (
		<InputOTP maxLength={6}>
			<InputOTPGroup>
				<InputOTPSlot index={0} />
				<InputOTPSlot index={1} />
				<InputOTPSlot index={2} />
			</InputOTPGroup>
			<InputOTPSeparator />
			<InputOTPGroup>
				<InputOTPSlot index={3} />
				<InputOTPSlot index={4} />
				<InputOTPSlot index={5} />
			</InputOTPGroup>
		</InputOTP>
	);
}
