// Publish / share screen — the endpoint of the flow. Confirms the form is live, shows a
// (mock) share link, and offers a preview. Responses are captured in the filler summary.
import {Check, Copy, ExternalLink, Play, Rows3, SquareStack} from "lucide-react";
import {useState} from "react";

import {Badge} from "../../badge";
import {Button} from "../../button";
import {Card, CardContent} from "../../card";
import {Input} from "../../input";
import {Separator} from "../../separator";
import type {FormDisplayMode, FormSchema} from "./model";

export interface PublishScreenProps {
	form: FormSchema;
	responseCount: number;
	displayMode: FormDisplayMode;
	onDisplayModeChange: (mode: FormDisplayMode) => void;
	onPreview: () => void;
	onBackToEditor: () => void;
	/**
	 * Show the one-question / list "Respondent view" selector. Off for flows whose preview always
	 * renders a single page (e.g. the RHF/RJSF engine widgets), where the choice would do nothing.
	 */
	showDisplayMode?: boolean;
}

const DISPLAY_MODE_OPTIONS: {
	value: FormDisplayMode;
	label: string;
	hint: string;
	icon: typeof SquareStack;
}[] = [
	{
		value: "one_question",
		label: "One question at a time",
		hint: "Typeform-style, one at a time.",
		icon: SquareStack,
	},
	{
		value: "list",
		label: "All on one page",
		hint: "A single scrollable list.",
		icon: Rows3,
	},
];

export function PublishScreen({
	form,
	responseCount,
	displayMode,
	onDisplayModeChange,
	onPreview,
	onBackToEditor,
	showDisplayMode = true,
}: PublishScreenProps) {
	const [copied, setCopied] = useState(false);
	const slug = form.title
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/(^-|-$)/g, "");
	const shareUrl = `https://forms.core.com/${slug || "my-form"}`;

	function copy() {
		try {
			void navigator.clipboard?.writeText(shareUrl);
		} catch {
			/* clipboard may be unavailable in the sandbox — the mock link is still shown */
		}
		setCopied(true);
		window.setTimeout(() => setCopied(false), 1500);
	}

	return (
		<div className="wwc:flex wwc:min-h-0 wwc:flex-1 wwc:flex-col wwc:items-center wwc:justify-center wwc:gap-6 wwc:overflow-auto wwc:bg-background wwc:px-8 wwc:py-12">
			<div className="wwc:flex wwc:flex-col wwc:items-center wwc:gap-3 wwc:text-center">
				<span className="wwc:flex wwc:size-12 wwc:items-center wwc:justify-center wwc:rounded-full wwc:bg-emerald-100 wwc:text-emerald-600">
					<Check className="wwc:size-6" />
				</span>
				<h1 className="wwc:text-2xl wwc:font-semibold wwc:tracking-tight wwc:text-foreground">
					Your form is published
				</h1>
				<p className="wwc:text-sm wwc:text-muted-foreground">
					<span className="wwc:font-medium wwc:text-foreground">{form.title}</span> is live and ready to collect
					responses.
				</p>
			</div>

			<Card className="wwc:w-full wwc:max-w-xl wwc:border wwc:border-border wwc:shadow-none">
				<CardContent className="wwc:flex wwc:flex-col wwc:gap-4 wwc:p-5">
					<div className="wwc:flex wwc:items-center wwc:gap-2">
						<Input readOnly value={shareUrl} className="wwc:flex-1" />
						<Button variant="outline" onClick={copy}>
							{copied ? <Check className="wwc:size-3.5" /> : <Copy className="wwc:size-3.5" />}
							{copied ? "Copied" : "Copy link"}
						</Button>
					</div>

					{showDisplayMode ? (
						<>
							<Separator />

							<div className="wwc:flex wwc:flex-col wwc:gap-3">
								<div className="wwc:flex wwc:flex-col wwc:gap-0.5">
									<span className="wwc:text-sm wwc:font-medium wwc:text-foreground">Respondent view</span>
									<span className="wwc:text-xs wwc:text-muted-foreground">
										Choose how questions appear when someone fills out the form.
									</span>
								</div>
								<div className="wwc:grid wwc:grid-cols-1 wwc:gap-2 wwc:sm:grid-cols-2">
									{DISPLAY_MODE_OPTIONS.map((option) => {
										const selected = displayMode === option.value;
										const Icon = option.icon;
										return (
											<button
												key={option.value}
												type="button"
												aria-pressed={selected}
												onClick={() => onDisplayModeChange(option.value)}
												className={`wwc:flex wwc:items-start wwc:gap-3 wwc:rounded-md wwc:border wwc:p-3 wwc:text-left wwc:transition-colors ${
													selected ? "wwc:border-primary wwc:bg-accent" : "wwc:border-border wwc:hover:bg-accent"
												}`}
											>
												<span className="wwc:mt-0.5 wwc:flex wwc:size-8 wwc:shrink-0 wwc:items-center wwc:justify-center wwc:rounded-md wwc:bg-muted wwc:text-muted-foreground">
													<Icon className="wwc:size-4" />
												</span>
												<span className="wwc:flex wwc:min-w-0 wwc:flex-1 wwc:flex-col wwc:gap-0.5">
													<span className="wwc:flex wwc:items-center wwc:gap-1.5">
														<span className="wwc:text-sm wwc:font-medium wwc:text-foreground">{option.label}</span>
														{selected ? <Check className="wwc:size-3.5 wwc:shrink-0 wwc:text-primary" /> : null}
													</span>
													<span className="wwc:text-xs wwc:text-muted-foreground">{option.hint}</span>
												</span>
											</button>
										);
									})}
								</div>
							</div>
						</>
					) : null}

					<Separator />

					<div className="wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-3">
						<Button onClick={onPreview}>
							<Play className="wwc:size-3.5" />
							Preview form
						</Button>
						<Button variant="outline" onClick={onBackToEditor}>
							Back to editor
						</Button>
						<a
							href={shareUrl}
							target="_blank"
							rel="noreferrer"
							className="wwc:ml-auto wwc:flex wwc:items-center wwc:gap-1 wwc:text-xs wwc:text-muted-foreground wwc:hover:text-foreground"
						>
							Open live form
							<ExternalLink className="wwc:size-3" />
						</a>
					</div>
				</CardContent>
			</Card>

			<div className="wwc:flex wwc:items-center wwc:gap-2 wwc:text-sm wwc:text-muted-foreground">
				<Badge variant="secondary" className="wwc:tabular-nums">
					{responseCount}
				</Badge>
				{responseCount === 1 ? "response collected" : "responses collected"}
				<span className="wwc:text-muted-foreground/60">·</span>
				<span className="wwc:tabular-nums">{form.questions.length}</span> questions
			</div>
		</div>
	);
}
