/**
 * Basic horizontal stepper.
 */
import {
	Stepper,
	StepperItem,
	StepperIndicator,
	StepperTitle,
	StepperDescription,
	StepperSeparator,
} from "@corensystem/coren-ui/stepper";

export function Default() {
	return (
		<Stepper className="wwc:w-full wwc:max-w-lg">
			<StepperItem status="complete">
				<StepperIndicator>1</StepperIndicator>
				<div>
					<StepperTitle>Account</StepperTitle>
					<StepperDescription>Create your account</StepperDescription>
				</div>
				<StepperSeparator />
			</StepperItem>
			<StepperItem status="current">
				<StepperIndicator>2</StepperIndicator>
				<div>
					<StepperTitle>Profile</StepperTitle>
					<StepperDescription>Set up your profile</StepperDescription>
				</div>
				<StepperSeparator />
			</StepperItem>
			<StepperItem status="upcoming">
				<StepperIndicator>3</StepperIndicator>
				<div>
					<StepperTitle>Confirm</StepperTitle>
					<StepperDescription>Review and confirm</StepperDescription>
				</div>
			</StepperItem>
		</Stepper>
	);
}
