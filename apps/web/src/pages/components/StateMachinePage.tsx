import {DEMO_ACTIONS, DEMO_EFFECTS, demoInstancesFor} from "@wakecap/core-ui/pages/state-machine-fixtures";
import {seedProcesses} from "@wakecap/core-ui/pages/wc3-process-views";
import {useState} from "react";

import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {CopyButton} from "@/components/ui/copy-button";
import {StateMachine} from "@/components/ui/state-machine";

export function StateMachinePage() {
	const [connect, setConnect] = useState(() => seedProcesses()[0]);
	const [workPermit, setWorkPermit] = useState(() => seedProcesses()[0]);
	const [bare, setBare] = useState(() => seedProcesses()[0]);

	return (
		<div className="wwc:space-y-8">
			<div>
				<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
					<h1 className="wwc:text-3xl wwc:font-bold">StateMachine</h1>
					<CopyButton
						value="StateMachine"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:text-muted-foreground wwc:mt-2">
					A state machine on a canvas, beside the panel that edits it. One widget, one per product cut.
				</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>connect</CardTitle>
					<CardDescription>
						WakeCap Connect V3&apos;s process page — header band, section rail, canvas and editing panel. This is what{" "}
						<code>ProcessDetail</code> mounts. Drag between two states to draw a transition: a legal drop creates it
						there and then, dashed and unbound, and opens its inspector on the one field a drag cannot supply. An
						illegal one is refused during the drag itself, and the reason reaches the banner verbatim from the rule that
						raised it.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:h-[640px] wwc:overflow-hidden wwc:rounded-lg wwc:border">
						<StateMachine
							actions={DEMO_ACTIONS}
							effects={DEMO_EFFECTS}
							instances={demoInstancesFor(connect)}
							process={connect}
							onChange={setConnect}
							className="wwc:h-full"
						/>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>work-permit</CardTitle>
					<CardDescription>
						The Digital Work Permit cut. The same canvas, the same editing panel, the same guards — the LEFT RAIL is the
						whole difference: <strong>General</strong>, <strong>Canvas</strong>, <strong>Form</strong>,{" "}
						<strong>Policy</strong>, then a rule, then <strong>Instances</strong> and <strong>Bottlenecks</strong>.
						General is the Settings section renamed, carrying the permit&apos;s type and description beside the
						record&apos;s own name and icon.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:h-[640px] wwc:overflow-hidden wwc:rounded-lg wwc:border">
						<StateMachine
							variant="work-permit"
							actions={DEMO_ACTIONS}
							effects={DEMO_EFFECTS}
							instances={demoInstancesFor(workPermit)}
							process={workPermit}
							onChange={setWorkPermit}
							className="wwc:h-full"
						/>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>shell={"{false}"}</CardTitle>
					<CardDescription>
						The graph alone, for embedding inside a surface that already has its own chrome. Not a variant — a variant
						is a product cut, and this is neither product. Layout drag still commits, so states can be arranged, but
						connections are off: the rail goes with the shell, and with no rail there is nowhere to bind the transition
						a drop would create.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:h-[520px] wwc:overflow-hidden wwc:rounded-lg wwc:border">
						<StateMachine
							shell={false}
							actions={DEMO_ACTIONS}
							effects={DEMO_EFFECTS}
							instances={demoInstancesFor(bare)}
							process={bare}
							onChange={setBare}
							className="wwc:h-full"
						/>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
