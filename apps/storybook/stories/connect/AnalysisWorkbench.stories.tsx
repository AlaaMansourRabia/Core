import type {Meta, StoryObj} from "storybook/internal/types";

import {AnalysisWorkbench} from "@corensystem/core-ui/pages/analysis-workbench";
import {ObjectAnalysisView} from "@corensystem/core-ui/pages/wc3-analysis-object-view";
import {seedAnalysisSession, type Wc3AnalysisSession} from "@corensystem/core-ui/pages/wc3-analysis-views";
import {useState} from "react";

const meta = {
	title: "Widgets/Connect/Analysis Workbench",
	component: AnalysisWorkbench,
	tags: ["autodocs"],
	parameters: {
		layout: "fullscreen",
		docs: {
			description: {
				component:
					"The stage-path query builder — source → filter → traverse → derive — with a route badge, a spec summary and the lineage of the spec that produced a result. Its most useful property is that an empty result is **named**, not blank: `source-empty`, `no-time-column`, `filters-excluded-all` or `all-unlinked`, so the user learns which stage discarded their rows.\n\nThe widget takes two required render slots, `renderSourceConfig` and `renderTraverseConfig` — exactly the two stages whose options differ between object analysis and data analysis. Everything else is the same in both modes, which is why they are slots rather than a mode branch inside the widget. The story below mounts `ObjectAnalysisView`, the thin real caller that supplies those two slots for object mode.",
			},
		},
	},
} satisfies Meta<typeof AnalysisWorkbench>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Object analysis, driven through its real caller so both stage slots are populated. */
export const Default: Story = {
	render: () => {
		const [session, setSession] = useState<Wc3AnalysisSession>(() => seedAnalysisSession());
		return (
			<div className="wwc:h-screen wwc:overflow-auto">
				<ObjectAnalysisView session={session} onSessionChange={setSession} />
			</div>
		);
	},
};
