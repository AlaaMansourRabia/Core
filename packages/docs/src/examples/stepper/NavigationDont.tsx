/**
 * Avoid trapping users without back navigation.
 */
import {
	Stepper,
	StepperItem,
	StepperIndicator,
	StepperTitle,
	StepperSeparator,
} from "@corensystem/coren-ui/stepper";
import {Check} from "lucide-react";

export function NavigationDont() {
	return (
		<div className="wwc:space-y-2">
			<Stepper className="wwc:w-full wwc:max-w-lg">
				<StepperItem status="complete">
					<StepperIndicator>
						<Check className="wwc:h-4 wwc:w-4" />
					</StepperIndicator>
					<StepperTitle className="wwc:text-muted-foreground">Account</StepperTitle>
					<StepperSeparator />
				</StepperItem>
				<StepperItem status="complete">
					<StepperIndicator>
						<Check className="wwc:h-4 wwc:w-4" />
					</StepperIndicator>
					<StepperTitle className="wwc:text-muted-foreground">Payment</StepperTitle>
					<StepperSeparator />
				</StepperItem>
				<StepperItem status="current">
					<StepperIndicator>3</StepperIndicator>
					<StepperTitle>Review</StepperTitle>
				</StepperItem>
			</Stepper>
			<p className="wwc:text-xs wwc:text-muted-foreground">
				No way to go back and edit previous steps
			</p>
		</div>
	);
}
