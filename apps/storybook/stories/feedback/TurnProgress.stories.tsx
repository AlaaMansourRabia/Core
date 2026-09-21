import type {Meta, StoryObj} from "storybook/internal/types";

import {Button} from "@wakecap/core-ui/button";
import {ThinkingPill} from "@wakecap/core-ui/thinking-pill";
import {TurnTimer} from "@wakecap/core-ui/turn-timer";
import {LineChart, Search, Sparkles} from "lucide-react";
import {useState} from "react";

const meta = {
	title: "Components/Feedback/Turn Progress",
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component:
					"Composition pattern for the lifecycle of an in-flight agent turn: `ThinkingPill` (mounted before any content has arrived) + `TurnTimer` (live duration counter that freezes on completion). Used by `AIChat` while waiting for the model.",
			},
		},
	},
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const ThinkingPills: Story = {
	render: () => (
		<div className="wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-4">
			<ThinkingPill />
			<ThinkingPill label="Generating" icon={<Sparkles className="wwc:h-3.5 wwc:w-3.5" />} />
			<ThinkingPill label="Researching" icon={<Search className="wwc:h-3.5 wwc:w-3.5" />} />
			<ThinkingPill label="Analysing" icon={<LineChart className="wwc:h-3.5 wwc:w-3.5" />} />
		</div>
	),
	parameters: {
		docs: {
			description: {
				story: "Inline indicator that an agent is processing before any output appears. Mount/unmount, don't toggle.",
			},
		},
	},
};

export const TurnTimerLive: Story = {
	render: () => <TurnTimer />,
	parameters: {
		docs: {
			description: {
				story: "Mono-text duration counter. Spinning ring dot, tens-of-seconds precision, ticks every 100ms.",
			},
		},
	},
};

export const TurnTimerDone: Story = {
	render: () => (
		<div className="wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-4">
			<TurnTimer done value="0.4s" />
			<TurnTimer done value="2.4s" />
			<TurnTimer done value="8.5s" />
			<TurnTimer done value="12.7s" />
		</div>
	),
	parameters: {
		docs: {
			description: {
				story: "Solid 4px dim dot, no animation, frozen final duration, 70% opacity.",
			},
		},
	},
};

type Phase = "idle" | "thinking" | "responding" | "done";

function TurnProgressDemo() {
	const [phase, setPhase] = useState<Phase>("idle");
	const [startedAt, setStartedAt] = useState<number | null>(null);
	const [finalValue, setFinalValue] = useState<string | null>(null);

	const start = () => {
		setStartedAt(Date.now());
		setFinalValue(null);
		setPhase("thinking");
	};
	const dismissThinking = () => setPhase("responding");
	const freeze = () => {
		if (startedAt !== null) {
			setFinalValue(`${((Date.now() - startedAt) / 1000).toFixed(1)}s`);
		}
		setPhase("done");
	};
	const reset = () => {
		setPhase("idle");
		setStartedAt(null);
		setFinalValue(null);
	};

	return (
		<div className="wwc:flex wwc:flex-col wwc:gap-4">
			<div className="wwc:flex wwc:flex-wrap wwc:gap-2">
				<Button size="sm" onClick={start} disabled={phase !== "idle"}>
					1. Start turn
				</Button>
				<Button size="sm" variant="outline" onClick={dismissThinking} disabled={phase !== "thinking"}>
					2. First content arrives
				</Button>
				<Button size="sm" variant="outline" onClick={freeze} disabled={phase !== "responding" && phase !== "thinking"}>
					3. Turn complete
				</Button>
				<Button size="sm" variant="ghost" onClick={reset} disabled={phase === "idle"}>
					Reset
				</Button>
			</div>

			<div className="wwc:flex wwc:min-h-32 wwc:flex-col wwc:gap-2 wwc:rounded-lg wwc:border wwc:bg-background wwc:p-4">
				{phase === "idle" && <p className="wwc:text-sm wwc:text-muted-foreground">Click "Start turn" to begin.</p>}

				{(phase === "thinking" || phase === "responding") && startedAt !== null && (
					<>
						{phase === "thinking" && <ThinkingPill />}
						{phase === "responding" && (
							<p className="wwc:text-sm wwc:text-foreground">
								Streaming response would appear here. The thinking pill has been dismissed but the timer keeps ticking.
							</p>
						)}
						<TurnTimer startedAt={startedAt} />
					</>
				)}

				{phase === "done" && (
					<>
						<p className="wwc:text-sm wwc:text-foreground">Final response. Timer is frozen below.</p>
						<TurnTimer done value={finalValue ?? "0.0s"} />
					</>
				)}
			</div>
		</div>
	);
}

export const Lifecycle: Story = {
	render: () => <TurnProgressDemo />,
	parameters: {
		docs: {
			description: {
				story:
					"Full composition: ThinkingPill + TurnTimer together. Click through the buttons to step from idle → thinking → responding → done.",
			},
		},
	},
};
