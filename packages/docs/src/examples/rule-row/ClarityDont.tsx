/**
 * Avoid cryptic expressions.
 */
import {RuleRow, RuleRowCondition, RuleRowAction} from "@corensystem/coren-ui/rule-row";

export function ClarityDont() {
	return (
		<RuleRow>
			<RuleRowCondition>s==1&amp;&amp;f&gt;0</RuleRowCondition>
			<RuleRowAction>fn(x)</RuleRowAction>
		</RuleRow>
	);
}
