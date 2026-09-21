import {LineChart, Search, Sparkles} from "lucide-react";
import {useState} from "react";

import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {CopyButton} from "@/components/ui/copy-button";
import {ThinkingPill} from "@/components/ui/thinking-pill";
import {TurnTimer} from "@/components/ui/turn-timer";

export function TurnProgressPage() {
	return (
		<div className="wwc:space-y-8">
			<div>
				<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
					<h1 className="wwc:text-3xl wwc:font-bold">Turn Progress</h1>
					<CopyButton
						value="Turn Progress"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:mt-2 wwc:text-muted-foreground">
					Two atoms (<code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">ThinkingPill</code> and{" "}
					<code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">TurnTimer</code>) plus a composition pattern
					that together render the lifecycle of an in-flight agent turn. Used by{" "}
					<code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">AIChat</code> while waiting for the model.
				</p>
			</div>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Thinking Pill</CardTitle>
						<CopyButton
							value="Turn Progress - Thinking Pill"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						Inline indicator that an agent is actively processing before any output has appeared. Mount/unmount, don't
						toggle.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-4">
						<ThinkingPill />
						<ThinkingPill label="Generating" icon={<Sparkles className="wwc:h-3.5 wwc:w-3.5" />} />
						<ThinkingPill label="Researching" icon={<Search className="wwc:h-3.5 wwc:w-3.5" />} />
						<ThinkingPill label="Analysing" icon={<LineChart className="wwc:h-3.5 wwc:w-3.5" />} />
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Turn Timer — Live</CardTitle>
						<CopyButton
							value="Turn Progress - Turn Timer — Live"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						Mono-text duration counter. Spinning ring dot, tens-of-seconds precision, ticks every 100ms.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<TurnTimer />
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Turn Timer — Done</CardTitle>
						<CopyButton
							value="Turn Progress - Turn Timer — Done"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						Solid 4px dim dot, no animation, frozen final duration, 70% opacity. Pass{" "}
						<code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">value</code> to display a precomputed
						duration.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-4">
						<TurnTimer done value="0.4s" />
						<TurnTimer done value="2.4s" />
						<TurnTimer done value="8.5s" />
						<TurnTimer done value="12.7s" />
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Turn Progress — Lifecycle</CardTitle>
						<CopyButton
							value="Turn Progress - Turn Progress — Lifecycle"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						Composition: <code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">ThinkingPill</code> +{" "}
						<code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">TurnTimer</code> together. Click the buttons
						to step through the lifecycle.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<TurnProgressDemo />
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Usage</CardTitle>
						<CopyButton
							value="Turn Progress - Usage"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent>
					<pre className="wwc:overflow-x-auto wwc:rounded-lg wwc:bg-muted wwc:p-4 wwc:text-sm">
						{`import { ThinkingPill } from "@/components/ui/thinking-pill";
import { TurnTimer } from "@/components/ui/turn-timer";

// Turn just started — show both
const startedAt = Date.now();
<>
  <ThinkingPill />
  <TurnTimer startedAt={startedAt} />
</>

// First content arrived — drop the pill, keep the live timer
<TurnTimer startedAt={startedAt} />

// Turn complete — freeze with done + the elapsed value
<TurnTimer done value="8.5s" />`}
					</pre>
				</CardContent>
			</Card>
		</div>
	);
}

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
