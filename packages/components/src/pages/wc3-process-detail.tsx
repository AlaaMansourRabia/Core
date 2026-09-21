import {StateMachine} from "./state-machine";
import {DEMO_ACTIONS, DEMO_EFFECTS, demoInstancesFor} from "./state-machine-fixtures";
import {type Wc3LineageNavTarget, type Wc3ProcessRecord} from "./wc3-process-shared";

// The single-process page — the Processes list's drill-in.
//
// It is a THIN WRAPPER, and deliberately so. Everything it used to own — the header band, the
// section rail, the canvas, the editing rail, Instances, Bottlenecks and Settings — moved into
// StateMachine (state-machine.tsx) when that became a widget, because the work-permit cut
// needed the same shell with a different section list. Two copies of a header and a rail would have
// drifted; one implementation with a VARIANT_TRAITS row each cannot.
//
// `full` is exactly what this page has always rendered: Canvas, Instances, Bottlenecks, Settings, in
// that order, with Settings still called Settings. That is a trait row, not an accident — see
// VARIANT_TRAITS.
//
// The four names the shell used to carry as top-level tabs — canvas / instances / bottlenecks /
// editor — are SECTIONS, because in the prototype (PageProcesses, line 7195) they are all facets of
// ONE process: its graph, its token panel, its SLA/aging panel and its editor panel. The editor is
// not a fifth section: editing happens in the builder's rail and in Settings, so there is no mode a
// user can be in where an edit is invisible.

type ProcessDetailProps = {
	process: Wc3ProcessRecord;
	onChange: (next: Wc3ProcessRecord) => void;
	onBack: () => void;
	onNavigate?: (target: Wc3LineageNavTarget) => void;
	/**
	 * This process was created in THIS session and has never run.
	 *
	 * Forwarded as the widget's `authoring` flag: the readouts, the two live-work sections and the
	 * provenance cards all report on an established process, and on one made ten seconds ago every
	 * number is zero and every rule it fails is "not finished yet". It also opens the rail on the
	 * canvas rather than wherever the variant leads, because the graph is the thing being written.
	 */
	isNew?: boolean;
};

export function ProcessDetail({process, onChange, onBack, onNavigate, isNew = false}: ProcessDetailProps) {
	return (
		<StateMachine
			variant="connect"
			// The Processes page is a DEMO surface over this repo's fixtures, so it says so: the widget
			// itself defaults every vocabulary to empty, and a real product passes its own here.
			actions={DEMO_ACTIONS}
			effects={DEMO_EFFECTS}
			instances={demoInstancesFor(process)}
			process={process}
			onChange={onChange}
			onBack={onBack}
			onNavigate={onNavigate}
			authoring={isNew}
		/>
	);
}
