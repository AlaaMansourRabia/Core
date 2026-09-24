/**
 * Avoid mixing unrelated fields in one section.
 */
import {FormLayout, FormSection, FormRow} from "@corensystem/coren-ui/form-layout";
import {Input} from "@corensystem/coren-ui/input";
import {Label} from "@corensystem/coren-ui/label";

export function GroupingDont() {
	return (
		<FormLayout>
			<FormSection title="Information">
				<FormRow>
					<Label htmlFor="form-group-dont-name">Name</Label>
					<Input id="form-group-dont-name" />
				</FormRow>
				<FormRow>
					<Label htmlFor="form-group-dont-card">Credit Card</Label>
					<Input id="form-group-dont-card" />
				</FormRow>
				<FormRow>
					<Label htmlFor="form-group-dont-notes">Notes</Label>
					<Input id="form-group-dont-notes" />
				</FormRow>
				<FormRow>
					<Label htmlFor="form-group-dont-zip">ZIP Code</Label>
					<Input id="form-group-dont-zip" />
				</FormRow>
			</FormSection>
		</FormLayout>
	);
}
