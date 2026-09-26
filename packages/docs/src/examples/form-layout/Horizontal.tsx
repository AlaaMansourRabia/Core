import {Button} from "@corensystem/coren-ui/button";
/**
 * Horizontal form layout with side-by-side labels.
 */
import {FormLayout, FormSection, FormRow, FormActions} from "@corensystem/coren-ui/form-layout";
import {Input} from "@corensystem/coren-ui/input";
import {Label} from "@corensystem/coren-ui/label";

export function Horizontal() {
	return (
		<FormLayout orientation="horizontal">
			<FormSection title="Settings">
				<FormRow>
					<Label htmlFor="form-horiz-site">Site Name</Label>
					<Input id="form-horiz-site" />
				</FormRow>
				<FormRow>
					<Label htmlFor="form-horiz-url">Site URL</Label>
					<Input id="form-horiz-url" type="url" />
				</FormRow>
			</FormSection>
			<FormActions>
				<Button>Update</Button>
			</FormActions>
		</FormLayout>
	);
}
