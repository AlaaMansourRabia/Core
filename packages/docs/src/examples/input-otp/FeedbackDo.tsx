/**
 * Show validation feedback clearly.
 */
import * as React from "react";
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSlot,
	InputOTPSeparator,
} from "@corensystem/coren-ui/input-otp";
import {CheckCircle2, XCircle} from "lucide-react";

export function FeedbackDo() {
	const [value, setValue] = React.useState("123456");
	const isValid = value === "123456";
	const isComplete = value.length === 6;

	return (
		<div className="wwc:space-y-3">
			<InputOTP maxLength={6} value={value} onChange={setValue}>
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
			{isComplete && (
				<div className={`wwc:flex wwc:items-center wwc:gap-2 wwc:text-sm ${isValid ? "wwc:text-green-600" : "wwc:text-destructive"}`}>
					{isValid ? (
						<>
							<CheckCircle2 className="wwc:h-4 wwc:w-4" />
							Code verified
						</>
					) : (
						<>
							<XCircle className="wwc:h-4 wwc:w-4" />
							Invalid code. Please try again.
						</>
					)}
				</div>
			)}
		</div>
	);
}
