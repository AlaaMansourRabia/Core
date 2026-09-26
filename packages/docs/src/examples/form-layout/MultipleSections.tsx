import {Button} from "@corensystem/coren-ui/button";
/**
 * Form with multiple logical sections.
 */
import {FormLayout, FormSection, FormRow, FormActions} from "@corensystem/coren-ui/form-layout";
import {Input} from "@corensystem/coren-ui/input";
import {Label} from "@corensystem/coren-ui/label";

export function MultipleSections() {
	return (
		<FormLayout>
			<FormSection title="Account" description="Your login credentials">
				<FormRow>
					<Label htmlFor="form-multi-username">Username</Label>
					<Input id="form-multi-username" />
				</FormRow>
				<FormRow>
					<Label htmlFor="form-multi-password">Password</Label>
					<Input id="form-multi-password" type="password" />
				</FormRow>
			</FormSection>
			<FormSection title="Profile" description="Public information">
				<FormRow>
					<Label htmlFor="form-multi-display">Display Name</Label>
					<Input id="form-multi-display" />
				</FormRow>
				<FormRow>
					<Label htmlFor="form-multi-bio">Bio</Label>
					<Input id="form-multi-bio" />
				</FormRow>
			</FormSection>
			<FormActions>
				<Button>Create Account</Button>
			</FormActions>
		</FormLayout>
	);
}
