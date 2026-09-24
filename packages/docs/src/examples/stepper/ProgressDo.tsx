/**
 * Clearly indicate current progress and completion.
 */
import {
	Stepper,
	StepperItem,
	StepperIndicator,
	StepperTitle,
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
				<StepperTitle>Details</StepperTitle>
				<StepperSeparator />
			</StepperItem>
			<StepperItem status="current">
				<StepperIndicator className="wwc:ring-2 wwc:ring-primary">2</StepperIndicator>
				<StepperTitle className="wwc:font-semibold">Review</StepperTitle>
				<StepperSeparator />
			</StepperItem>
			<StepperItem status="upcoming">
				<StepperIndicator>3</StepperIndicator>
				<StepperTitle className="wwc:text-muted-foreground">Submit</StepperTitle>
			</StepperItem>
		</Stepper>
	);
}
