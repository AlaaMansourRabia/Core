/**
 * Allow navigation back to completed steps.
 */
import {
	Stepper,
	StepperItem,
	StepperIndicator,
	StepperLabel,
	StepperSeparator,
} from "@corensystem/coren-ui/stepper";
import {Check} from "lucide-react";

export function NavigationDo() {
	return (
		<Stepper className="wwc:w-full wwc:max-w-lg">
			<StepperItem status="complete" className="wwc:cursor-pointer">
				<StepperIndicator>
					<Check className="wwc:h-4 wwc:w-4" />
				</StepperIndicator>
				<StepperLabel className="wwc:underline wwc:decoration-dotted wwc:underline-offset-4">
					Account
				</StepperLabel>
				<StepperSeparator />
			</StepperItem>
			<StepperItem status="complete" className="wwc:cursor-pointer">
				<StepperIndicator>
					<Check className="wwc:h-4 wwc:w-4" />
				</StepperIndicator>
				<StepperLabel className="wwc:underline wwc:decoration-dotted wwc:underline-offset-4">
					Payment
				</StepperLabel>
				<StepperSeparator />
			</StepperItem>
			<StepperItem status="current">
				<StepperIndicator>3</StepperIndicator>
				<StepperLabel>Review</StepperLabel>
			</StepperItem>
		</Stepper>
	);
}
