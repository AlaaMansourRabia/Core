/**
 * Tool call with error.
 */
import {ToolCall, ToolCallName, ToolCallStatus, ToolCallError} from "@corensystem/coren-ui/tool-call";

export function Error() {
	return (
		<ToolCall>
			<ToolCallName>fetch_data</ToolCallName>
			<ToolCallStatus status="error" />
			<ToolCallError>Connection timeout</ToolCallError>
		</ToolCall>
	);
}
