import type {Meta, StoryObj} from "storybook/internal/types";

import {type CommentItem, CommentThread} from "@wakecap/core-ui/comment-thread";
import {InlineCommentComposer} from "@wakecap/core-ui/inline-comment-composer";
import {Edit3, Flag, ThumbsUp, Trash2} from "lucide-react";
import {useState} from "react";

const meta = {
	title: "Widgets/Comments/Comment Thread",
	component: CommentThread,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component:
					"Asana-style threaded discussion. Each `<Comment>` has avatar · author + timestamp · status badges · body · optional attachments · reaction strip · reply / more menu. Pairs with `<InlineCommentComposer>` (PromptInput-style flag toggle, image, date picker, mention, and primary Post button).",
			},
		},
	},
} satisfies Meta<typeof CommentThread>;

export default meta;
type Story = StoryObj<typeof meta>;

const baseComments: CommentItem[] = [
	{
		id: "c-1",
		author: {name: "Layla N."},
		timestamp: "2 hours ago",
		body: "The mez floor only has 4 of 12 LBS rooms mapped — can you flag the unmapped ones for follow-up?",
		badges: [{id: "flag", icon: <Flag className="wwc:h-3 wwc:w-3" />, label: "Flagged", tone: "warning"}],
		reactions: [
			{id: "thumbs-up", icon: <ThumbsUp className="wwc:h-3 wwc:w-3" />, label: "thumbs up", count: 3, active: true},
		],
		menu: [
			{id: "edit", label: "Edit", icon: <Edit3 className="wwc:h-3.5 wwc:w-3.5" />},
			{id: "delete", label: "Delete", icon: <Trash2 className="wwc:h-3.5 wwc:w-3.5" />, tone: "destructive"},
		],
		replies: [
			{
				id: "c-1-r-1",
				author: {name: "Ahmed R."},
				timestamp: "45 minutes ago",
				body: "On it. I'll cross-check against the IoT plan and post the unmapped list here.",
				replies: [
					{
						id: "c-1-r-1-r-1",
						author: {name: "Layla N."},
						timestamp: "20 minutes ago",
						body: "Perfect — please include the source drawing revision for each room.",
					},
				],
			},
		],
	},
	{
		id: "c-2",
		author: {name: "Maya K."},
		timestamp: "yesterday",
		body: "Attached the latest blueprint for reference — see the highlighted rooms.",
		badges: [{id: "due", label: "Due 4/16/25", tone: "muted"}],
		attachments: [
			{id: "att-1", type: "image", thumbnailUrl: "https://placehold.co/280x160/e5e5e5/737373?text=Blueprint"},
		],
		reactions: [{id: "thumbs-up", icon: <ThumbsUp className="wwc:h-3 wwc:w-3" />, label: "thumbs up", count: 1}],
	},
];

export const Default: Story = {
	render: () => {
		function Demo() {
			const [comments, setComments] = useState(baseComments);
			const [draft, setDraft] = useState("");
			const [flagged, setFlagged] = useState(false);
			const [date, setDate] = useState<Date | undefined>();
			return (
				<div className="wwc:max-w-2xl">
					<CommentThread
						comments={comments}
						composer={
							<InlineCommentComposer
								value={draft}
								onChange={setDraft}
								onSubmit={({text}) => {
									setComments((prev) => [
										...prev,
										{
											id: `c-${Date.now()}`,
											author: {name: "You", initials: "Y"},
											timestamp: "just now",
											body: text,
											badges: [
												...(flagged
													? [
															{
																id: "flag",
																icon: <Flag className="wwc:h-3 wwc:w-3" />,
																label: "Flagged",
																tone: "warning" as const,
															},
														]
													: []),
												...(date
													? [{id: "due", label: `Due ${date.toLocaleDateString()}`, tone: "muted" as const}]
													: []),
											],
										},
									]);
									setDraft("");
									setFlagged(false);
									setDate(undefined);
								}}
								flagged={flagged}
								onFlaggedChange={setFlagged}
								date={date}
								onDateChange={setDate}
								onAddImage={() => undefined}
								onAddMention={() => undefined}
							/>
						}
					/>
				</div>
			);
		}
		return <Demo />;
	},
};

export const ComposerTopNewestFirst: Story = {
	render: () => {
		function Demo() {
			const [comments, setComments] = useState(baseComments);
			const [draft, setDraft] = useState("");
			const [flagged, setFlagged] = useState(false);
			const [date, setDate] = useState<Date | undefined>();
			return (
				<div className="wwc:max-w-2xl">
					<CommentThread
						comments={comments}
						composerPosition="top"
						composer={
							<InlineCommentComposer
								value={draft}
								onChange={setDraft}
								onSubmit={({text}) => {
									setComments((prev) => [
										{
											id: `c-${Date.now()}`,
											author: {name: "You", initials: "Y"},
											timestamp: "just now",
											body: text,
											badges: [
												...(flagged
													? [
															{
																id: "flag",
																icon: <Flag className="wwc:h-3 wwc:w-3" />,
																label: "Flagged",
																tone: "warning" as const,
															},
														]
													: []),
												...(date
													? [{id: "due", label: `Due ${date.toLocaleDateString()}`, tone: "muted" as const}]
													: []),
											],
										},
										...prev,
									]);
									setDraft("");
									setFlagged(false);
									setDate(undefined);
								}}
								flagged={flagged}
								onFlaggedChange={setFlagged}
								date={date}
								onDateChange={setDate}
								onAddImage={() => undefined}
								onAddMention={() => undefined}
							/>
						}
					/>
				</div>
			);
		}
		return <Demo />;
	},
	parameters: {
		docs: {
			description: {
				story:
					'`composerPosition="top"` + the consumer prepends new comments instead of appending. Newest land directly under the composer.',
			},
		},
	},
};

export const ComposerOnly: Story = {
	render: () => {
		function Demo() {
			const [value, setValue] = useState("");
			const [flagged, setFlagged] = useState(false);
			const [date, setDate] = useState<Date | undefined>();
			return (
				<div className="wwc:max-w-2xl">
					<InlineCommentComposer
						value={value}
						onChange={setValue}
						onSubmit={() => setValue("")}
						onCancel={() => {
							setValue("");
							setFlagged(false);
							setDate(undefined);
						}}
						flagged={flagged}
						onFlaggedChange={setFlagged}
						date={date}
						onDateChange={setDate}
						onAddImage={() => undefined}
						onAddMention={() => undefined}
					/>
				</div>
			);
		}
		return <Demo />;
	},
	parameters: {
		docs: {
			description: {
				story:
					"`<InlineCommentComposer>` rendered standalone. Cancel button appears when `onCancel` is wired. Post is disabled until `value.trim()` is non-empty (mirrors `<PromptInput>`'s Send behaviour).",
			},
		},
	},
};

export const Empty: Story = {
	render: () => (
		<div className="wwc:max-w-2xl">
			<CommentThread comments={[]} />
		</div>
	),
};
