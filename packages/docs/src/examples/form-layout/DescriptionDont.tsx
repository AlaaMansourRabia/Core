/**
 * Avoid sections without context for complex forms.
 */
import {FormLayout, FormSection, FormRow} from "@corensystem/coren-ui/form-layout";
import {Input} from "@corensystem/coren-ui/input";
import {Label} from "@corensystem/coren-ui/label";
import {Checkbox} from "@corensystem/coren-ui/checkbox";

export function DescriptionDont() {
	return (
		<FormLayout>
			<FormSection title="Settings">
				<FormRow>
					<Label htmlFor="form-desc-dont-webhook">Webhook URL</Label>
					<Input id="form-desc-dont-webhook" />
				</FormRow>
				<FormRow>
					<div className="wwc:flex wwc:items-center wwc:gap-2">
						<Checkbox id="form-desc-dont-retry" />
						<Label htmlFor="form-desc-dont-retry">Enable retry</Label>
					</div>
				</FormRow>
			</FormSection>
		</FormLayout>
	);
}
