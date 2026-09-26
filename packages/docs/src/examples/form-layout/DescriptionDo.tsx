/**
 * Add section descriptions to provide context.
 */
import {FormLayout, FormSection, FormRow} from "@corensystem/coren-ui/form-layout";
import {Input} from "@corensystem/coren-ui/input";
import {Label} from "@corensystem/coren-ui/label";

export function DescriptionDo() {
	return (
		<FormLayout>
			<FormSection title="Notifications" description="Choose how you want to receive updates and alerts.">
				<FormRow>
					<Label htmlFor="form-desc-do-email">Email for notifications</Label>
					<Input id="form-desc-do-email" type="email" />
				</FormRow>
			</FormSection>
		</FormLayout>
	);
}
