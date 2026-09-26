/**
 * Basic form layout with sections and rows.
 */
import {FormLayout, FormSection, FormRow, FormActions} from "@corensystem/coren-ui/form-layout";
import {Input} from "@corensystem/coren-ui/input";
import {Label} from "@corensystem/coren-ui/label";
import {Button} from "@corensystem/coren-ui/button";

export function Default() {
	return (
		<FormLayout>
			<FormSection title="Personal Information">
				<FormRow>
					<Label htmlFor="form-layout-name">Name</Label>
					<Input id="form-layout-name" placeholder="Enter your name" />
				</FormRow>
				<FormRow>
					<Label htmlFor="form-layout-email">Email</Label>
					<Input id="form-layout-email" type="email" placeholder="Enter your email" />
				</FormRow>
			</FormSection>
			<FormActions>
				<Button variant="outline">Cancel</Button>
				<Button>Save</Button>
			</FormActions>
		</FormLayout>
	);
}
