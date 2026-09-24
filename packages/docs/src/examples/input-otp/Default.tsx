/**
 * Basic OTP input with 6 digits.
 */
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSlot,
} from "@corensystem/coren-ui/input-otp";

export function Default() {
	return (
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
