/**
 * Group related fields in logical sections.
 */
import {FormLayout, FormSection, FormRow} from "@corensystem/coren-ui/form-layout";
import {Input} from "@corensystem/coren-ui/input";
import {Label} from "@corensystem/coren-ui/label";

export function GroupingDo() {
	return (
		<FormLayout>
			<FormSection title="Billing Address">
				<FormRow>
					<Label htmlFor="form-group-street">Street</Label>
					<Input id="form-group-street" />
				</FormRow>
				<FormRow>
					<Label htmlFor="form-group-city">City</Label>
					<Input id="form-group-city" />
				</FormRow>
			</FormSection>
			<FormSection title="Shipping Address">
				<FormRow>
					<Label htmlFor="form-group-ship-street">Street</Label>
					<Input id="form-group-ship-street" />
				</FormRow>
				<FormRow>
					<Label htmlFor="form-group-ship-city">City</Label>
					<Input id="form-group-ship-city" />
				</FormRow>
			</FormSection>
		</FormLayout>
	);
}
