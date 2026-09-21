import {cn} from "@wakecap/core-utils";
import {OTPInput, OTPInputContext} from "input-otp";
import {Dot} from "lucide-react";
import * as React from "react";

/** One-time password input with individual character slots and grouping support. */
const InputOTP = React.forwardRef<React.ElementRef<typeof OTPInput>, React.ComponentPropsWithoutRef<typeof OTPInput>>(
	({className, containerClassName, ...props}, ref) => (
		<OTPInput
			ref={ref}
			containerClassName={cn("wwc:flex wwc:items-center wwc:gap-2 wwc:has-[:disabled]:opacity-50", containerClassName)}
			className={cn("wwc:disabled:cursor-not-allowed", className)}
			{...props}
		/>
	),
);
InputOTP.displayName = "InputOTP";

const InputOTPGroup = React.forwardRef<React.ElementRef<"div">, React.ComponentPropsWithoutRef<"div">>(
	({className, ...props}, ref) => <div ref={ref} className={cn("wwc:flex wwc:items-center", className)} {...props} />,
);
InputOTPGroup.displayName = "InputOTPGroup";

const InputOTPSlot = React.forwardRef<React.ElementRef<"div">, React.ComponentPropsWithoutRef<"div"> & {index: number}>(
	({index, className, ...props}, ref) => {
		const inputOTPContext = React.useContext(OTPInputContext);
		const {char, hasFakeCaret, isActive} = inputOTPContext.slots[index];

		return (
			<div
				ref={ref}
				className={cn(
					"wwc:relative wwc:flex wwc:h-10 wwc:w-10 wwc:items-center wwc:justify-center wwc:border-y wwc:border-r wwc:border-input wwc:text-sm wwc:transition-all wwc:first:rounded-l-md wwc:first:border-l wwc:last:rounded-r-md",
					isActive && "wwc:z-10 wwc:ring-2 wwc:ring-ring wwc:ring-offset-background",
					className,
				)}
				{...props}
			>
				{char}
				{hasFakeCaret && (
					<div className="wwc:pointer-events-none wwc:absolute wwc:inset-0 wwc:flex wwc:items-center wwc:justify-center">
						<div className="wwc:h-4 wwc:w-px wwc:animate-caret-blink wwc:bg-foreground wwc:duration-1000" />
					</div>
				)}
			</div>
		);
	},
);
InputOTPSlot.displayName = "InputOTPSlot";

const InputOTPSeparator = React.forwardRef<React.ElementRef<"div">, React.ComponentPropsWithoutRef<"div">>(
	({...props}, ref) => (
		<div ref={ref} role="separator" {...props}>
			<Dot />
		</div>
	),
);
InputOTPSeparator.displayName = "InputOTPSeparator";

export {InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator};
