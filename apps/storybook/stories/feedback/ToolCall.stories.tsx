import type {Meta, StoryObj} from "storybook/internal/types";

import {ToolCall} from "@wakecap/core-ui/tool-call";
import {useState} from "react";

const meta = {
	title: "Components/Feedback/Tool Call",
	component: ToolCall,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component:
					"Inline tool/function call widget for AI chats. Header (status, function name, args, chevron) and result summary line are always visible. The expanded body adds a scrollable output area. Supports status states (running / success / error / cancelled) and works for any function: Read, Write, Edit, Bash, Grep, Glob, WebSearch, WebFetch, Task, TodoWrite, etc.",
			},
		},
	},
	args: {
		name: "Read",
		args: "/var/folders/s0/j7r99kwj4b7gbxmdh3sx3ndh0000gn/T/casestudy-buddy-uplo…",
		status: "success",
		summary: "Read 1 line",
	},
	argTypes: {
		status: {control: "select", options: ["running", "success", "error", "cancelled"]},
	},
} satisfies Meta<typeof ToolCall>;

export default meta;
type Story = StoryObj<typeof meta>;

const longJson = `{"type":"image","source":{"type":"base64","data":"iVBORw0KGgoAAAANSUhEUgAAAr…
Y9TYx40rjf6T5kMfreJpDfMR6Mgrh1Y3JXIY2KpbQ4D34gfFmeBrkNCfRb9eBZFJxGZVJ…
7K2bQ1lMZHdnVGfUzMq3HWJN3LvKjVMOkXnjqJWE7sXNGCVK9GJa8fnB1RwhPL/8FkD…
+JhYzvKqGqSXKzjLQRm8jBzFdLO0wKrR/UbdPgWPK4uLQfYPpzD1c7y/Knx5xL/G9V…
ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890
…`;

export const Default: Story = {};

export const ClosedByDefault: Story = {
	args: {defaultOpen: false},
	render: (args) => (
		<div className="wwc:max-w-xl">
			<ToolCall {...args}>{longJson}</ToolCall>
		</div>
	),
};

export const OpenByDefault: Story = {
	args: {defaultOpen: true},
	render: (args) => (
		<div className="wwc:max-w-xl">
			<ToolCall {...args}>{longJson}</ToolCall>
		</div>
	),
};

export const Statuses: Story = {
	render: () => (
		<div className="wwc:flex wwc:max-w-xl wwc:flex-col wwc:gap-3">
			<ToolCall name="Bash" args="pnpm test" status="running" summary="Running… 2.4s elapsed" />
			<ToolCall name="Read" args="/path/to/file.txt" status="success" summary="Read 42 lines" />
			<ToolCall name="Bash" args="pnpm typecheck" status="error" summary="Exited 2 · 4.1s">
				{`error TS2322: Type 'string' is not assignable to type 'number'.\n  at src/foo.ts(12,3)`}
			</ToolCall>
			<ToolCall
				name="WebFetch"
				args="https://example.com/api/large-payload"
				status="cancelled"
				summary="Cancelled by user"
			/>
		</div>
	),
};

export const Functions: Story = {
	render: () => (
		<div className="wwc:flex wwc:max-w-xl wwc:flex-col wwc:gap-3">
			<ToolCall name="Read" args="/Users/jane/notes.md" summary="Read 18 lines">
				{`# Notes\n\n- Pick up groceries\n- Reply to Alex about the design review\n- Cancel the streaming subscription`}
			</ToolCall>
			<ToolCall name="Bash" args="git status --short" summary="Exited 0 · 0.2s">
				{` M packages/components/src/tool-call.tsx\n?? apps/storybook/stories/feedback/ToolCall.stories.tsx`}
			</ToolCall>
			<ToolCall name="Grep" args="useEffect" summary="Found 12 matches in 7 files">
				{`apps/web/src/pages/examples/TaskMonitorExamplePage.tsx:168\napps/web/src/pages/examples/TaskMonitorExamplePage.tsx:172\npackages/components/src/task-monitor.tsx:223\npackages/components/src/chat/core-ai-chat.tsx:101`}
			</ToolCall>
			<ToolCall name="WebSearch" args="latest TanStack Query release" summary="5 results">
				{`1. @tanstack/react-query v5.x — what's new\n2. Migrating from v4 to v5\n3. Suspense integration in v5\n4. Devtools 2025 update`}
			</ToolCall>
			<ToolCall name="Task" args="Audit a11y across the chip primitive" summary="Sub-agent finished · 14.6s">
				{`Audited Chip across all variants. Found 2 issues:\n1. Missing aria-pressed on filter variant when controlled\n2. Remove button lacks role="button" fallback when disabled`}
			</ToolCall>
		</div>
	),
};

export const NoArgsNoOutput: Story = {
	args: {name: "TodoWrite", args: undefined, summary: "Updated 3 tasks"},
};

export const Controlled: Story = {
	render: (args) => {
		function Demo() {
			const [open, setOpen] = useState(false);
			return (
				<div className="wwc:flex wwc:max-w-xl wwc:flex-col wwc:gap-3">
					<button
						type="button"
						onClick={() => setOpen((o) => !o)}
						className="wwc:self-start wwc:rounded wwc:border wwc:border-border wwc:px-2 wwc:py-1 wwc:text-xs"
					>
						Toggle from outside (open={String(open)})
					</button>
					<ToolCall {...args} open={open} onOpenChange={setOpen}>
						{longJson}
					</ToolCall>
				</div>
			);
		}
		return <Demo />;
	},
};

export const InChatThread: Story = {
	parameters: {layout: "padded"},
	render: () => (
		<div className="wwc:mx-auto wwc:flex wwc:max-w-xl wwc:flex-col wwc:gap-4">
			<div className="wwc:self-end wwc:rounded-2xl wwc:rounded-br-md wwc:bg-muted wwc:px-3 wwc:py-2 wwc:text-sm">
				What does this temp file contain?
			</div>
			<div className="wwc:flex wwc:flex-col wwc:gap-2 wwc:text-sm">
				<p>Let me check.</p>
				<ToolCall
					name="Read"
					args="/var/folders/s0/j7r99kwj4b7gbxmdh3sx3ndh0000gn/T/casestudy-buddy-uplo…"
					summary="Read 1 line"
					defaultOpen
				>
					{longJson}
				</ToolCall>
				<p>It's a base64-encoded PNG — the case-study buddy upload payload.</p>
			</div>
		</div>
	),
};
