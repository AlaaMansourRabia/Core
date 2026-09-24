/**
 * Vertical stepper layout.
 */
import {
	Stepper,
	StepperItem,
	StepperIndicator,
	StepperLabel,
	StepperDescription,
	StepperSeparator,
} from "@corensystem/coren-ui/stepper";

export function Vertical() {
	return (
		<Stepper orientation="vertical" className="wwc:max-w-xs">
			<StepperItem status="complete">
				<StepperIndicator>1</StepperIndicator>
				<div>
					<StepperLabel>Sign up</StepperLabel>
					<StepperDescription>Create your account</StepperDescription>
				</div>
				<StepperSeparator />
			</StepperItem>
			<StepperItem status="complete">
				<StepperIndicator>2</StepperIndicator>
				<div>
					<StepperLabel>Verify email</StepperLabel>
					<StepperDescription>Confirm your email address</StepperDescription>
				</div>
				<StepperSeparator />
			</StepperItem>
			<StepperItem status="current">
				<StepperIndicator>3</StepperIndicator>
				<div>
					<StepperLabel>Add payment</StepperLabel>
					<StepperDescription>Set up billing</StepperDescription>
				</div>
				<StepperSeparator />
			</StepperItem>
			<StepperItem status="upcoming">
				<StepperIndicator>4</StepperIndicator>
				<div>
					<StepperLabel>Start using</StepperLabel>
					<StepperDescription>Begin your journey</StepperDescription>
				</div>
			</StepperItem>
		</Stepper>
	);
}
