import {Archive, Edit3, Flag, ThumbsUp, Trash2} from "lucide-react";
import {useState} from "react";

import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {type CommentItem, CommentThread} from "@/components/ui/comment-thread";
import {CopyButton} from "@/components/ui/copy-button";
import {InlineCommentComposer} from "@/components/ui/inline-comment-composer";

const initialComments: CommentItem[] = [
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
				menu: [{id: "edit", label: "Edit", icon: <Edit3 className="wwc:h-3.5 wwc:w-3.5" />}],
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
		menu: [{id: "archive", label: "Archive", icon: <Archive className="wwc:h-3.5 wwc:w-3.5" />}],
	},
];

export function CommentThreadPage() {
	const [comments, setComments] = useState<CommentItem[]>(initialComments);
	const [draft, setDraft] = useState("");
	const [flagged, setFlagged] = useState(false);
	const [date, setDate] = useState<Date | undefined>();

	const handleSubmit = ({text, flagged: f, date: d}: {text: string; flagged: boolean; date?: Date}) => {
		const newComment: CommentItem = {
			id: `c-${Date.now()}`,
			author: {name: "You", initials: "Y"},
			timestamp: "just now",
			body: text,
			badges: [
				...(f
					? [{id: "flag", icon: <Flag className="wwc:h-3 wwc:w-3" />, label: "Flagged", tone: "warning" as const}]
					: []),
				...(d ? [{id: "due", label: `Due ${d.toLocaleDateString()}`, tone: "muted" as const}] : []),
			],
			reactions: [],
			menu: [{id: "delete", label: "Delete", icon: <Trash2 className="wwc:h-3.5 wwc:w-3.5" />, tone: "destructive"}],
		};
		setComments((prev) => [...prev, newComment]);
		setDraft("");
		setFlagged(false);
		setDate(undefined);
	};

	return (
		<div className="wwc:space-y-8">
			<div>
				<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
					<h1 className="wwc:text-3xl wwc:font-bold">Comment Thread</h1>
					<CopyButton
						value="Comment Thread"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:text-muted-foreground wwc:mt-2">
					Asana-style threaded discussion: each{" "}
					<code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">Comment</code> has avatar · author + timestamp
					· status badges · body · optional attachments · reaction strip · reply / more menu. Pairs with{" "}
					<code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">InlineCommentComposer</code>{" "}
					(PromptInput-style — flag toggle, image, date, mention, post).
				</p>
			</div>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Default</CardTitle>
						<CopyButton
							value="Comment Thread - Default"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						Thread with two top-level comments (one with replies, one with an image attachment), composer at the bottom.
						Posting a draft prepends a new comment with the carried badges.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<CommentThread
						comments={comments}
						composer={
							<InlineCommentComposer
								value={draft}
								onChange={setDraft}
								onSubmit={handleSubmit}
								flagged={flagged}
								onFlaggedChange={setFlagged}
								date={date}
								onDateChange={setDate}
								onAddImage={() => undefined}
								onAddMention={() => undefined}
							/>
						}
					/>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Composer only</CardTitle>
						<CopyButton
							value="Comment Thread - Composer only"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						<code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">InlineCommentComposer</code> on its own —
						Cancel button shows when <code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">onCancel</code> is
						provided.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<ComposerSolo />
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Composer top, newest first</CardTitle>
						<CopyButton
							value="Comment Thread - Composer top, newest first"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						<code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">composerPosition="top"</code> +
						reverse-sorted <code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">comments</code>. New posts
						land directly under the composer.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<NewestFirstThread />
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Empty thread</CardTitle>
						<CopyButton
							value="Comment Thread - Empty"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						When there are no comments, a default empty state renders. Override via{" "}
						<code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">emptyState</code>.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<CommentThread comments={[]} />
				</CardContent>
			</Card>
		</div>
	);
}

function NewestFirstThread() {
	const [comments, setComments] = useState<CommentItem[]>(initialComments);
	const [draft, setDraft] = useState("");
	const [flagged, setFlagged] = useState(false);
	const [date, setDate] = useState<Date | undefined>();

	return (
		<CommentThread
			comments={comments}
			composerPosition="top"
			composer={
				<InlineCommentComposer
					value={draft}
					onChange={setDraft}
					onSubmit={({text, flagged: f, date: d}) => {
						const next: CommentItem = {
							id: `c-${Date.now()}`,
							author: {name: "You", initials: "Y"},
							timestamp: "just now",
							body: text,
							badges: [
								...(f
									? [
											{
												id: "flag",
												icon: <Flag className="wwc:h-3 wwc:w-3" />,
												label: "Flagged",
												tone: "warning" as const,
											},
										]
									: []),
								...(d ? [{id: "due", label: `Due ${d.toLocaleDateString()}`, tone: "muted" as const}] : []),
							],
						};
						setComments((prev) => [next, ...prev]);
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
	);
}

function ComposerSolo() {
	const [value, setValue] = useState("");
	const [flagged, setFlagged] = useState(false);
	const [date, setDate] = useState<Date | undefined>();
	return (
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
	);
}
