import type {Meta, StoryObj} from "storybook/internal/types";

import {CommentComposer} from "@corensystem/core-ui/comment-composer";
import {useState} from "react";

const meta = {
	title: "Widgets/Comments/Comment Composer",
	component: CommentComposer,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component:
					"Bordered text input with a formatting toolbar (inline format, alignment, lists, quote/code, image) and a submit button. Fully presentational — the toolbar fires onToolbarAction callbacks; wire it to your editor of choice. Submits on click or Cmd/Ctrl+Enter.",
			},
		},
	},
} satisfies Meta<typeof CommentComposer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => (
		<div className="wwc:max-w-3xl">
			<CommentComposer />
		</div>
	),
};

export const CustomToolbar: Story = {
	render: () => (
		<div className="wwc:max-w-3xl">
			<CommentComposer
				toolbarActions={["bold", "italic", "list-bulleted", "list-numbered", "code"]}
				placeholder="Reply to this comment..."
				submitLabel="Reply"
			/>
		</div>
	),
};

export const CustomLabels: Story = {
	render: () => (
		<div className="wwc:max-w-3xl">
			<CommentComposer placeholder="Leave a review..." submitLabel="Post review" />
		</div>
	),
};

export const Submitting: Story = {
	render: () => (
		<div className="wwc:max-w-3xl">
			<CommentComposer defaultValue="This is in flight..." isSubmitting />
		</div>
	),
};

export const Disabled: Story = {
	render: () => (
		<div className="wwc:max-w-3xl">
			<CommentComposer disabled placeholder="Comments are closed" />
		</div>
	),
};

export const Controlled: Story = {
	render: () => {
		function Demo() {
			const [value, setValue] = useState("");
			const [submitted, setSubmitted] = useState<string[]>([]);
			return (
				<div className="wwc:max-w-3xl wwc:space-y-3">
					<CommentComposer
						value={value}
						onChange={setValue}
						onSubmit={(v) => {
							setSubmitted((prev) => [...prev, v]);
							setValue("");
						}}
						onToolbarAction={(action) => console.log("toolbar:", action)}
					/>
					{submitted.length > 0 && (
						<div className="wwc:rounded-md wwc:border wwc:border-border wwc:bg-muted/40 wwc:p-3">
							<div className="wwc:mb-2 wwc:text-xs wwc:font-semibold wwc:text-muted-foreground">Submitted</div>
							<ul className="wwc:space-y-1 wwc:text-sm">
								{submitted.map((s, i) => (
									<li key={i} className="wwc:rounded wwc:bg-background wwc:px-2 wwc:py-1">
										{s}
									</li>
								))}
							</ul>
						</div>
					)}
				</div>
			);
		}
		return <Demo />;
	},
	parameters: {
		docs: {
			description: {
				story:
					"Fully controlled: consumer owns `value` (via `onChange`) and resets it on submit. Toolbar actions are logged to the console.",
			},
		},
	},
};
