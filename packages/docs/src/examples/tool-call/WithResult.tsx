/**
 * Tool call with result.
 */
import {ToolCall, ToolCallName, ToolCallResult, ToolCallStatus} from "@corensystem/coren-ui/tool-call";

export function WithResult() {
	return (
		<ToolCall>
			<ToolCallName>calculate</ToolCallName>
			<ToolCallStatus status="complete" />
			<ToolCallResult>Result: 42</ToolCallResult>
		</ToolCall>
	);
}
