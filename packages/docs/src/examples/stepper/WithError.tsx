/**
 * Stepper with error state.
 */
import {
	Stepper,
	StepperItem,
	StepperIndicator,
	StepperTitle,
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
					<StepperTitle>Account</StepperTitle>
					<StepperDescription>Account created</StepperDescription>
				</div>
				<StepperSeparator />
			</StepperItem>
			<StepperItem status="error">
				<StepperIndicator>
					<AlertCircle className="wwc:h-4 wwc:w-4" />
				</StepperIndicator>
				<div>
					<StepperTitle className="wwc:text-destructive">Payment</StepperTitle>
					<StepperDescription className="wwc:text-destructive">
						Card declined
					</StepperDescription>
				</div>
				<StepperSeparator />
			</StepperItem>
			<StepperItem status="upcoming">
				<StepperIndicator>3</StepperIndicator>
				<div>
					<StepperTitle>Confirm</StepperTitle>
					<StepperDescription>Complete order</StepperDescription>
				</div>
			</StepperItem>
		</Stepper>
	);
}
