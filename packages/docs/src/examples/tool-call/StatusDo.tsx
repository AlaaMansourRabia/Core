/**
 * Show clear status.
 */
import {ToolCall, ToolCallName, ToolCallStatus} from "@corensystem/coren-ui/tool-call";

export function StatusDo() {
	return (
		<ToolCall>
			<ToolCallName>process</ToolCallName>
			<ToolCallStatus status="running">Processing...</ToolCallStatus>
		</ToolCall>
	);
}
