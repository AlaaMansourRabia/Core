import {Button} from "@corensystem/coren-ui/button";
/**
 * Place form actions at the end with clear primary action.
 */
import {FormLayout, FormSection, FormRow, FormActions} from "@corensystem/coren-ui/form-layout";
import {Input} from "@corensystem/coren-ui/input";
import {Label} from "@corensystem/coren-ui/label";

export function ActionsDo() {
	return (
		<FormLayout>
			<FormSection>
				<FormRow>
					<Label htmlFor="form-actions-do-email">Email</Label>
					<Input id="form-actions-do-email" type="email" />
				</FormRow>
			</FormSection>
			<FormActions>
				<Button variant="outline">Cancel</Button>
				<Button>Subscribe</Button>
			</FormActions>
		</FormLayout>
	);
}
