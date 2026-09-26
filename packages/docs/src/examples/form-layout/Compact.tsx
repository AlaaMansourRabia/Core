import {Button} from "@corensystem/coren-ui/button";
/**
 * Compact form layout with reduced spacing.
 */
import {FormLayout, FormSection, FormRow, FormActions} from "@corensystem/coren-ui/form-layout";
import {Input} from "@corensystem/coren-ui/input";
import {Label} from "@corensystem/coren-ui/label";

export function Compact() {
	return (
		<FormLayout size="sm">
			<FormSection>
				<FormRow>
					<Label htmlFor="form-compact-search">Search</Label>
					<Input id="form-compact-search" placeholder="Quick search..." />
				</FormRow>
			</FormSection>
			<FormActions>
				<Button size="sm">Go</Button>
			</FormActions>
		</FormLayout>
	);
}
