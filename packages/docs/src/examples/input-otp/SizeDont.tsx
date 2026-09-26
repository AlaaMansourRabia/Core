/**
 * Avoid input slots that are too small or cramped.
 */
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSlot,
} from "@corensystem/coren-ui/input-otp";

export function SizeDont() {
	return (
		<InputOTP maxLength={6}>
			<InputOTPGroup>
				{/* Too small - hard to tap on mobile */}
				<InputOTPSlot index={0} className="wwc:w-6 wwc:h-6 wwc:text-xs" />
				<InputOTPSlot index={1} className="wwc:w-6 wwc:h-6 wwc:text-xs" />
				<InputOTPSlot index={2} className="wwc:w-6 wwc:h-6 wwc:text-xs" />
				<InputOTPSlot index={3} className="wwc:w-6 wwc:h-6 wwc:text-xs" />
				<InputOTPSlot index={4} className="wwc:w-6 wwc:h-6 wwc:text-xs" />
				<InputOTPSlot index={5} className="wwc:w-6 wwc:h-6 wwc:text-xs" />
			</InputOTPGroup>
		</InputOTP>
	);
}
