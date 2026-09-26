/**
 * OTP input with alphanumeric pattern.
 */
import {InputOTP, InputOTPGroup, InputOTPSlot} from "@corensystem/coren-ui/input-otp";
import {REGEXP_ONLY_DIGITS_AND_CHARS} from "input-otp";

export function WithPattern() {
	return (
		<div className="wwc:space-y-2">
			<InputOTP maxLength={6} pattern={REGEXP_ONLY_DIGITS_AND_CHARS}>
				<InputOTPGroup>
					<InputOTPSlot index={0} />
					<InputOTPSlot index={1} />
					<InputOTPSlot index={2} />
					<InputOTPSlot index={3} />
					<InputOTPSlot index={4} />
					<InputOTPSlot index={5} />
				</InputOTPGroup>
			</InputOTP>
			<p className="wwc:text-xs wwc:text-muted-foreground">Letters and numbers allowed</p>
		</div>
	);
}
