import type {Meta, StoryObj} from "storybook/internal/types";

import {StateMachine} from "@wakecap/core-ui/pages/state-machine";
import {DEMO_ACTIONS, DEMO_EFFECTS, demoInstancesFor} from "@wakecap/core-ui/pages/state-machine-fixtures";
import {createProcess} from "@wakecap/core-ui/pages/wc3-process-shared";
import {seedProcesses} from "@wakecap/core-ui/pages/wc3-process-views";
import {defaultTemplateGraph} from "@wakecap/core-ui/pages/work-permit-templates";
import {useState} from "react";

const meta = {
	title: "Widgets/State Machine",
	component: StateMachine,
	tags: ["autodocs"],
	parameters: {
		layout: "fullscreen",
		docs: {
			description: {
				component:
					"The state-machine authoring surface, whole: a header band, a left section rail, the graph on a " +
					"full-bleed canvas, the editing panel beside it and a live validity footer under it.\n\n" +
					"**One widget, four surfaces.** Two products author a state machine, and each of them authors a NEW one " +
					"and reads an EXISTING one — so the widget answers on two axes, and the four stories below are those two " +
					"axes crossed. Both products are callers; neither owns a copy, which is what stops a fix to the canvas " +
					"from having to be made twice.\n\n" +
					"| | new | existing |\n| --- | --- | --- |\n" +
					'| **WakeCap Connect V3** | `variant="connect" authoring` | `variant="connect"` |\n' +
					'| **Work Permit template** | `variant="work-permit" authoring` | `variant="work-permit"` |\n\n' +
					"`variant` is the PRODUCT CUT and today it changes the left rail alone — which sections, in what order, " +
					"under what labels, and whether General carries the permit fields. `authoring` is the AGE of the record: " +
					"it strips the readouts, drops the two live-work sections, reduces General to identity, and opens the rail " +
					"on the canvas, because on a graph made ten seconds ago every number is zero and every rule it fails is " +
					'"not finished yet". Both live in tables rather than branches, so a canvas that needs to diverge later ' +
					"becomes a new row.\n\n" +
					"`GraphCanvas` supplies the canvas chrome; everything specific to a state machine is here — the " +
					"four-handle node (two handles alone and a self-loop draws nothing, while every backward edge overlays the " +
					"forward one it runs beside), the drag guards that refuse an illegal edge **during** the drag, and the " +
					"refusals quoted verbatim from `checkTransition()`. A legal connection drag **commits on drop**, unbound: " +
					"the key and the kind are derived, the endpoints came from the drag, and the binding — the one field a " +
					"gesture cannot supply — is left null. The new edge is drawn dashed, selected, and its inspector opens on " +
					"that field; rule `L7` holds the graph back from publishing until it binds. Every edit routes through a " +
					"pure helper and lands as one `onChange(next)`, so a host can undo, persist or diff a graph without the " +
					"widget knowing how it stores anything. The canvas is on React Flow's defaults — the built-in default " +
					"node, default bezier edges, default handles and default selection — so it reads like the graphs on " +
					"reactflow.dev/examples rather than a bespoke box with a colour per transition kind.\n\n" +
					"`shell={false}` mounts the graph alone, for a host that already has its own chrome. Not shown here " +
					"because it is not a product surface — see the manifest.",
			},
		},
	},
} satisfies Meta<typeof StateMachine>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * A new Connect V3 process, exactly as `createProcess()` hands one back — the worked example:
 * Draft → In review → Active → Closed with a Rejected branch that can reopen, every edge unbound.
 */
const newConnectProcess = () =>
	createProcess({name: "Equipment handover", icon: "workflow", objectTypeId: "ot_permit", statusProp: "permit_status"});

/**
 * A new permit template, from the register's OWN seed rather than a copy of it, so this story and
 * New Template cannot drift: the standard permit lifecycle with the shipped graph's custom states
 * dropped, and its edges already bound to real permit actions.
 */
const newPermitTemplate = () => defaultTemplateGraph("Hot Work Permit v1");

/**
 * **A third product**, with none of this repo's fixtures — the case
 * [#251](https://github.com/wakecap/Wakecore/issues/251) filed.
 *
 * Nothing here is `connect` or `work-permit`. The rail is declared through `sections`, the binding
 * vocabulary through `actions`, the tokens through `instances`. No PR into core-ui, no key added to
 * an enum, no demo permits rendered in a product that has none.
 *
 * Bind a transition and the picker offers **these four actions**; pick one outside them and
 * `checkTransition` refuses it against THIS list. Leave one unbound and rule L7 holds the graph back
 * — but only because a vocabulary was supplied. Pass no `actions` at all and L7 stays quiet, because
 * "not bound" says nothing when the host never said what binding means.
 */
export const CustomProduct: Story = {
	render: () => {
		const [process, setProcess] = useState(() => {
			const seeded = createProcess({
				name: "NCR routing",
				icon: "workflow",
				objectTypeId: "ot_ncr",
				statusProp: "ncr_status",
			});
			// Bind the seeded example to this product's own actions, to show ids that are not the demo's.
			const bind = ["ncr.raise", "ncr.assign", "ncr.verify", "ncr.close", "ncr.raise"];
			return {...seeded, transitions: seeded.transitions.map((t, i) => ({...t, actionTypeId: bind[i] ?? null}))};
		});
		return (
			<div className="wwc:h-screen">
				<StateMachine
					variant="connect"
					sections={[{items: ["canvas"]}, {items: ["instances", "general"], divider: true}]}
					sectionLabels={{general: "NCR settings", instances: "Non-conformances"}}
					actions={[
						{id: "ncr.raise", label: "Raise NCR"},
						{id: "ncr.assign", label: "Assign to trade"},
						{id: "ncr.verify", label: "Verify closure"},
						{id: "ncr.close", label: "Close NCR"},
					]}
					effects={[
						{id: "ncr.notify_trade", label: "notify_trade"},
						{id: "ncr.start_clock", label: "start_clock"},
					]}
					instances={[
						{id: "ncr-1", ncr_status: "draft", created_at: "2026-09-01 08:00", title: "Rebar spacing"},
						{id: "ncr-2", ncr_status: "in_review", created_at: "2026-08-28 11:30", title: "Slab finish"},
						{id: "ncr-3", ncr_status: "active", created_at: "2026-08-20 09:15", title: "Duct alignment"},
					]}
					process={process}
					onChange={setProcess}
					className="wwc:h-full"
				/>
			</div>
		);
	},
};

/**
 * **Read-only** — the graph as most people meet it.
 *
 * Pan, zoom, select and inspect; no node drag, no connection gesture, no add forms, no deletes, no
 * Tidy layout. Before `readOnly` the closest thing was `shell={false}`, which stripped the header
 * and the rail and still committed a `moveState` on every nudge.
 */
export const ReadOnly: Story = {
	render: () => {
		const [process, setProcess] = useState(() => seedProcesses()[0]);
		return (
			<div className="wwc:h-screen">
				<StateMachine
					variant="connect"
					readOnly
					actions={DEMO_ACTIONS}
					effects={DEMO_EFFECTS}
					instances={demoInstancesFor(process)}
					process={process}
					onChange={setProcess}
					className="wwc:h-full"
				/>
			</div>
		);
	},
};

/**
 * **WakeCap Connect V3 — new process.** What the Processes list drills into the moment Create
 * process is confirmed.
 *
 * Opens on the **Canvas**, and that is the point: the graph is the only thing there is yet. The rail
 * is Canvas / General alone — Instances and Bottlenecks are views of live work this process has
 * never done — and the header carries the name and nothing else, because the glyph, product chip,
 * SLA badge and counts would all be reporting zeros.
 *
 * The canvas starts on a **worked example**, not a blank page: Draft → In review → Active → Closed,
 * with a Rejected branch that can reopen. It is structurally complete — one initial, a terminal, an
 * active work-authorizing state, everything reachable, an outgoing edge on every non-terminal — so
 * the author edits a lifecycle down to theirs instead of inventing one from two disconnected boxes.
 *
 * Every edge is **unbound** and drawn dashed, and the footer says so as five L7s. That is the one
 * thing a generic process cannot seed: which of *your* action types fires "submit". Binding them is
 * the remaining work, and the footer is a checklist over a working graph rather than a diagnosis of
 * a broken one.
 */
export const NewProcess: Story = {
	render: () => {
		const [process, setProcess] = useState(newConnectProcess);
		return (
			<div className="wwc:h-screen">
				<StateMachine
					variant="connect"
					authoring
					actions={DEMO_ACTIONS}
					effects={DEMO_EFFECTS}
					instances={demoInstancesFor(process)}
					process={process}
					onChange={setProcess}
					className="wwc:h-full"
				/>
			</div>
		);
	},
};

/**
 * **WakeCap Connect V3 — existing process.** The single-process page, which is exactly what
 * `ProcessDetail` mounts.
 *
 * Everything the new cut strips is back, because here the numbers are real: the glyph, the product
 * chip, the SLA model, the lint count, the states/transitions/tokens line, and **Instances** and
 * **Bottlenecks** in the rail beside Canvas and Settings.
 *
 * Drag **Draft → Submitted** to watch the guards refuse a duplicate edge mid-drag. Drag to a state it
 * has no edge to and the edge is created there and then — dashed, selected, and waiting on its action
 * binding in the panel.
 */
export const Process: Story = {
	render: () => {
		const [process, setProcess] = useState(() => seedProcesses()[0]);
		return (
			<div className="wwc:h-screen">
				<StateMachine
					variant="connect"
					actions={DEMO_ACTIONS}
					effects={DEMO_EFFECTS}
					instances={demoInstancesFor(process)}
					process={process}
					onChange={setProcess}
					className="wwc:h-full"
				/>
			</div>
		);
	},
};

/**
 * **Work Permit template — new template.** What **New Template** opens in the permit template
 * register.
 *
 * Opens on the **Canvas** even though this cut's rail leads with General: a new template's identity
 * fields are three inputs in front of the thing actually being made. The rail is General / Canvas /
 * Form / Policy, with Instances and Bottlenecks dropped — no permit has ever run on this version.
 *
 * The canvas starts on the register's own default: the standard permit lifecycle with the shipped
 * graph's custom states dropped. A permit template is a variation on a lifecycle every permit
 * already shares, not a blank page — and unlike the generic process above, this one KNOWS its
 * ontology, so its edges arrive already bound and the graph opens publishable.
 *
 * In the product this carries **Discard**, **Save as draft** and **Save and publish** on the far
 * right. Those are the host's, passed through `headerActions`, because what "saving" means belongs to
 * whoever owns the record — the register publishes a version, the Connect page autosaves.
 */
export const NewPermitTemplate: Story = {
	render: () => {
		const [process, setProcess] = useState(newPermitTemplate);
		return (
			<div className="wwc:h-screen">
				<StateMachine
					variant="work-permit"
					authoring
					actions={DEMO_ACTIONS}
					effects={DEMO_EFFECTS}
					instances={demoInstancesFor(process)}
					process={process}
					onChange={setProcess}
					className="wwc:h-full"
				/>
			</div>
		);
	},
};

/**
 * **Work Permit template — existing template.** What opening a row in the register shows.
 *
 * The permit cut in full: **General**, **Canvas**, **Form**, **Policy**, then a rule, then
 * **Instances** and **Bottlenecks**. General is the Settings section renamed, and it carries the
 * permit's type and description in its Identity card beside the record's own name and icon — one
 * place to answer "what is this permit", not two. The type picker offers only the values this
 * process's own rows carry, so it cannot drift from the fixture. Form is a scaffold; pass `formSlot`
 * to fill it.
 */
export const PermitTemplate: Story = {
	render: () => {
		const [process, setProcess] = useState(() => seedProcesses()[0]);
		return (
			<div className="wwc:h-screen">
				<StateMachine
					variant="work-permit"
					actions={DEMO_ACTIONS}
					effects={DEMO_EFFECTS}
					instances={demoInstancesFor(process)}
					process={process}
					onChange={setProcess}
					className="wwc:h-full"
				/>
			</div>
		);
	},
};
