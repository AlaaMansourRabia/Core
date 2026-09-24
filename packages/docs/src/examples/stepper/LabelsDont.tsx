/**
 * Avoid vague or numbered-only step labels.
 */
import {
	Stepper,
	StepperItem,
	StepperIndicator,
	StepperLabel,
	StepperSeparator,
} from "@corensystem/coren-ui/stepper";

export function LabelsDont() {
	return (
		<Stepper className="wwc:w-full wwc:max-w-lg">
			<StepperItem status="complete">
				<StepperIndicator>1</StepperIndicator>
				<StepperLabel>Step 1</StepperLabel>
				<StepperSeparator />
			</StepperItem>
			<StepperItem status="current">
				<StepperIndicator>2</StepperIndicator>
				<StepperLabel>Step 2</StepperLabel>
				<StepperSeparator />
			</StepperItem>
			<StepperItem status="upcoming">
				<StepperIndicator>3</StepperIndicator>
				<StepperLabel>Step 3</StepperLabel>
			</StepperItem>
		</Stepper>
	);
}
