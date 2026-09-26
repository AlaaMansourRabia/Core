/**
 * Avoid unclear status.
 */
import {ToolCall, ToolCallName} from "@corensystem/coren-ui/tool-call";

export function StatusDont() {
	return (
		<ToolCall>
			<ToolCallName>process</ToolCallName>
		</ToolCall>
	);
}
