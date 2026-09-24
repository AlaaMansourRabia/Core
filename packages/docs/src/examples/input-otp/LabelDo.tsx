/**
 * Provide clear instructions for OTP input.
 */
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSlot,
	InputOTPSeparator,
} from "@corensystem/coren-ui/input-otp";
import {Label} from "@corensystem/coren-ui/label";

export function LabelDo() {
	return (
		<div className="wwc:space-y-4">
			<div className="wwc:space-y-2">
				<Label htmlFor="otp-input">Verification Code</Label>
				<p className="wwc:text-sm wwc:text-muted-foreground">
					Enter the 6-digit code sent to your email
				</p>
			</div>
			<InputOTP id="otp-input" maxLength={6}>
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
		</div>
	);
}
