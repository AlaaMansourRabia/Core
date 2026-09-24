/**
 * Avoid vague or numbered-only step labels.
 */
import {
	Stepper,
	StepperItem,
	StepperIndicator,
	StepperTitle,
	StepperSeparator,
} from "@corensystem/coren-ui/stepper";

export function LabelsDont() {
	return (
		<Stepper className="wwc:w-full wwc:max-w-lg">
			<StepperItem status="complete">
				<StepperIndicator>1</StepperIndicator>
				<StepperTitle>Step 1</StepperTitle>
				<StepperSeparator />
			</StepperItem>
			<StepperItem status="current">
				<StepperIndicator>2</StepperIndicator>
				<StepperTitle>Step 2</StepperTitle>
				<StepperSeparator />
			</StepperItem>
			<StepperItem status="upcoming">
				<StepperIndicator>3</StepperIndicator>
				<StepperTitle>Step 3</StepperTitle>
			</StepperItem>
		</Stepper>
	);
}
