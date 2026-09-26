/**
 * Use appropriately sized input slots.
 */
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSlot,
	InputOTPSeparator,
} from "@corensystem/coren-ui/input-otp";

export function SizeDo() {
	return (
		<InputOTP maxLength={6}>
			<InputOTPGroup>
				<InputOTPSlot index={0} className="wwc:w-12 wwc:h-12 wwc:text-lg" />
				<InputOTPSlot index={1} className="wwc:w-12 wwc:h-12 wwc:text-lg" />
				<InputOTPSlot index={2} className="wwc:w-12 wwc:h-12 wwc:text-lg" />
			</InputOTPGroup>
			<InputOTPSeparator />
			<InputOTPGroup>
				<InputOTPSlot index={3} className="wwc:w-12 wwc:h-12 wwc:text-lg" />
				<InputOTPSlot index={4} className="wwc:w-12 wwc:h-12 wwc:text-lg" />
				<InputOTPSlot index={5} className="wwc:w-12 wwc:h-12 wwc:text-lg" />
			</InputOTPGroup>
		</InputOTP>
	);
}
