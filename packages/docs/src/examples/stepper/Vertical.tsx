/**
 * Vertical stepper layout.
 */
import {
	Stepper,
	StepperItem,
	StepperIndicator,
	StepperTitle,
	StepperDescription,
	StepperSeparator,
} from "@corensystem/coren-ui/stepper";

export function Vertical() {
	return (
		<Stepper orientation="vertical" className="wwc:max-w-xs">
			<StepperItem status="complete">
				<StepperIndicator>1</StepperIndicator>
				<div>
					<StepperTitle>Sign up</StepperTitle>
					<StepperDescription>Create your account</StepperDescription>
				</div>
				<StepperSeparator />
			</StepperItem>
			<StepperItem status="complete">
				<StepperIndicator>2</StepperIndicator>
				<div>
					<StepperTitle>Verify email</StepperTitle>
					<StepperDescription>Confirm your email address</StepperDescription>
				</div>
				<StepperSeparator />
			</StepperItem>
			<StepperItem status="current">
				<StepperIndicator>3</StepperIndicator>
				<div>
					<StepperTitle>Add payment</StepperTitle>
					<StepperDescription>Set up billing</StepperDescription>
				</div>
				<StepperSeparator />
			</StepperItem>
			<StepperItem status="upcoming">
				<StepperIndicator>4</StepperIndicator>
				<div>
					<StepperTitle>Start using</StepperTitle>
					<StepperDescription>Begin your journey</StepperDescription>
				</div>
			</StepperItem>
		</Stepper>
	);
}
