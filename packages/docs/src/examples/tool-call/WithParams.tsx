/**
 * Tool call with parameters.
 */
import {ToolCall, ToolCallName, ToolCallParams} from "@corensystem/coren-ui/tool-call";

export function WithParams() {
	return (
		<ToolCall>
			<ToolCallName>read_file</ToolCallName>
			<ToolCallParams>{"path: '/src/index.ts'"}</ToolCallParams>
		</ToolCall>
	);
}
