/**
 * Stepper with icons instead of numbers.
 */
import {
	Stepper,
	StepperItem,
	StepperIndicator,
	StepperLabel,
	StepperSeparator,
} from "@corensystem/coren-ui/stepper";
import {User, CreditCard, Check, Package} from "lucide-react";

export function WithIcons() {
	return (
		<Stepper className="wwc:w-full wwc:max-w-lg">
			<StepperItem status="complete">
				<StepperIndicator>
					<Check className="wwc:h-4 wwc:w-4" />
				</StepperIndicator>
				<StepperLabel>Account</StepperLabel>
				<StepperSeparator />
			</StepperItem>
			<StepperItem status="complete">
				<StepperIndicator>
					<Check className="wwc:h-4 wwc:w-4" />
				</StepperIndicator>
				<StepperLabel>Payment</StepperLabel>
				<StepperSeparator />
			</StepperItem>
			<StepperItem status="current">
				<StepperIndicator>
					<Package className="wwc:h-4 wwc:w-4" />
				</StepperIndicator>
				<StepperLabel>Shipping</StepperLabel>
				<StepperSeparator />
			</StepperItem>
			<StepperItem status="upcoming">
				<StepperIndicator>
					<CreditCard className="wwc:h-4 wwc:w-4" />
				</StepperIndicator>
				<StepperLabel>Review</StepperLabel>
			</StepperItem>
		</Stepper>
	);
}
