/**
 * Default rule row for conditions.
 */
import {RuleRow, RuleRowCondition, RuleRowAction} from "@corensystem/coren-ui/rule-row";

export function Default() {
	return (
		<RuleRow>
			<RuleRowCondition>If score &gt; 80</RuleRowCondition>
			<RuleRowAction>Mark as passed</RuleRowAction>
		</RuleRow>
	);
}
