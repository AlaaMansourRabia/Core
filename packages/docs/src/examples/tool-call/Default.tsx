/**
 * Default tool call display.
 */
import {ToolCall, ToolCallName, ToolCallStatus} from "@corensystem/coren-ui/tool-call";

export function Default() {
	return (
		<ToolCall>
			<ToolCallName>search_files</ToolCallName>
			<ToolCallStatus status="running" />
		</ToolCall>
	);
}
