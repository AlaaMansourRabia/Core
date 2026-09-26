/**
 * Clearly indicate current progress and completion.
 */
import {
	Stepper,
	StepperItem,
	StepperIndicator,
	StepperLabel,
	StepperSeparator,
} from "@corensystem/coren-ui/stepper";
import {Check} from "lucide-react";

export function ProgressDo() {
	return (
		<Stepper className="wwc:w-full wwc:max-w-lg">
			<StepperItem status="complete">
				<StepperIndicator>
					<Check className="wwc:h-4 wwc:w-4" />
				</StepperIndicator>
				<StepperLabel>Details</StepperLabel>
				<StepperSeparator />
			</StepperItem>
			<StepperItem status="current">
				<StepperIndicator className="wwc:ring-2 wwc:ring-primary">2</StepperIndicator>
				<StepperLabel className="wwc:font-semibold">Review</StepperLabel>
				<StepperSeparator />
			</StepperItem>
			<StepperItem status="upcoming">
				<StepperIndicator>3</StepperIndicator>
				<StepperLabel className="wwc:text-muted-foreground">Submit</StepperLabel>
			</StepperItem>
		</Stepper>
	);
}
