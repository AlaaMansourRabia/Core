/**
 * Rule row with AND/OR operators.
 */
import {RuleRow, RuleRowCondition, RuleRowOperator, RuleRowAction} from "@corensystem/coren-ui/rule-row";

export function WithOperator() {
	return (
		<RuleRow>
			<RuleRowCondition>Status = Active</RuleRowCondition>
			<RuleRowOperator>AND</RuleRowOperator>
			<RuleRowCondition>Role = Admin</RuleRowCondition>
			<RuleRowAction>Grant access</RuleRowAction>
		</RuleRow>
	);
}
