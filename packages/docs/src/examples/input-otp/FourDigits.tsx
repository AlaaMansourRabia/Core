/**
 * 4-digit OTP input (common for PIN codes).
 */
import {InputOTP, InputOTPGroup, InputOTPSlot} from "@corensystem/coren-ui/input-otp";

export function FourDigits() {
	return (
		<InputOTP maxLength={4}>
			<InputOTPGroup>
				<InputOTPSlot index={0} />
				<InputOTPSlot index={1} />
				<InputOTPSlot index={2} />
				<InputOTPSlot index={3} />
			</InputOTPGroup>
		</InputOTP>
	);
}
