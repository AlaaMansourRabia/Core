/**
 * Use clear, descriptive step labels.
 */
import {
	Stepper,
	StepperItem,
	StepperIndicator,
	StepperLabel,
	StepperDescription,
	StepperSeparator,
} from "@corensystem/coren-ui/stepper";

export function LabelsDo() {
	return (
		<Stepper className="wwc:w-full wwc:max-w-lg">
			<StepperItem status="complete">
				<StepperIndicator>1</StepperIndicator>
				<div>
					<StepperLabel>Shipping Address</StepperLabel>
					<StepperDescription>Where to deliver</StepperDescription>
				</div>
				<StepperSeparator />
			</StepperItem>
			<StepperItem status="current">
				<StepperIndicator>2</StepperIndicator>
				<div>
					<StepperLabel>Payment Method</StepperLabel>
					<StepperDescription>How to pay</StepperDescription>
				</div>
				<StepperSeparator />
			</StepperItem>
			<StepperItem status="upcoming">
				<StepperIndicator>3</StepperIndicator>
				<div>
					<StepperLabel>Order Review</StepperLabel>
					<StepperDescription>Confirm details</StepperDescription>
				</div>
			</StepperItem>
		</Stepper>
	);
}
