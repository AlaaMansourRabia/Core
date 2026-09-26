/**
 * Editable rule row.
 */
import {RuleRow, RuleRowCondition, RuleRowAction, RuleRowActions} from "@corensystem/coren-ui/rule-row";
import {Button} from "@corensystem/coren-ui/button";
import {Trash2} from "lucide-react";

export function Editable() {
	return (
		<RuleRow editable>
			<RuleRowCondition editable>Value &gt; 100</RuleRowCondition>
			<RuleRowAction editable>Send alert</RuleRowAction>
			<RuleRowActions>
				<Button variant="ghost" size="icon"><Trash2 className="wwc:h-4 wwc:w-4" /></Button>
			</RuleRowActions>
		</RuleRow>
	);
}
