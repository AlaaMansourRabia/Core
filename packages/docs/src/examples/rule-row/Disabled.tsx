/**
 * Disabled rule row.
 */
import {RuleRow, RuleRowCondition, RuleRowAction} from "@corensystem/coren-ui/rule-row";

export function Disabled() {
	return (
		<RuleRow disabled>
			<RuleRowCondition>Inactive rule</RuleRowCondition>
			<RuleRowAction>No action</RuleRowAction>
		</RuleRow>
	);
}
