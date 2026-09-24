/**
 * Stepper with error state.
 */
import {
	Stepper,
	StepperItem,
	StepperIndicator,
	StepperLabel,
	StepperDescription,
	StepperSeparator,
} from "@corensystem/coren-ui/stepper";
import {AlertCircle} from "lucide-react";

export function WithError() {
	return (
		<Stepper className="wwc:w-full wwc:max-w-lg">
			<StepperItem status="complete">
				<StepperIndicator>1</StepperIndicator>
				<div>
					<StepperLabel>Account</StepperLabel>
					<StepperDescription>Account created</StepperDescription>
				</div>
				<StepperSeparator />
			</StepperItem>
			<StepperItem status="error">
				<StepperIndicator>
					<AlertCircle className="wwc:h-4 wwc:w-4" />
				</StepperIndicator>
				<div>
					<StepperLabel className="wwc:text-destructive">Payment</StepperLabel>
					<StepperDescription className="wwc:text-destructive">
						Card declined
					</StepperDescription>
				</div>
				<StepperSeparator />
			</StepperItem>
			<StepperItem status="upcoming">
				<StepperIndicator>3</StepperIndicator>
				<div>
					<StepperLabel>Confirm</StepperLabel>
					<StepperDescription>Complete order</StepperDescription>
				</div>
			</StepperItem>
		</Stepper>
	);
}
