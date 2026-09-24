/**
 * Use clear, descriptive step labels.
 */
import {
	Stepper,
	StepperItem,
	StepperIndicator,
	StepperTitle,
	StepperDescription,
	StepperSeparator,
} from "@corensystem/coren-ui/stepper";

export function LabelsDo() {
	return (
		<Stepper className="wwc:w-full wwc:max-w-lg">
			<StepperItem status="complete">
				<StepperIndicator>1</StepperIndicator>
				<div>
					<StepperTitle>Shipping Address</StepperTitle>
					<StepperDescription>Where to deliver</StepperDescription>
				</div>
				<StepperSeparator />
			</StepperItem>
			<StepperItem status="current">
				<StepperIndicator>2</StepperIndicator>
				<div>
					<StepperTitle>Payment Method</StepperTitle>
					<StepperDescription>How to pay</StepperDescription>
				</div>
				<StepperSeparator />
			</StepperItem>
			<StepperItem status="upcoming">
				<StepperIndicator>3</StepperIndicator>
				<div>
					<StepperTitle>Order Review</StepperTitle>
					<StepperDescription>Confirm details</StepperDescription>
				</div>
			</StepperItem>
		</Stepper>
	);
}
