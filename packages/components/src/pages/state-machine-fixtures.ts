import type {StateMachineEffect, StateMachineFlagOption} from "./state-machine";
import {WC3_ACTION_TYPES} from "./wc3-ontology-data";
import {demoInstances} from "./wc3-process-data";
import type {StateMachineAction, Wc3ProcessInstanceRow, Wc3ProcessRecord} from "./wc3-process-shared";

/**
 * The demo vocabularies, in one entry that only stories and demo pages import.
 *
 * {@link StateMachine} takes its domain through props and defaults them to EMPTY, so a consumer
 * pulls none of this. That is the point of the split: `wc3-ontology-data` is 197 KB raw and
 * `wc3-process-data` 74 KB, and until the widget stopped reading them at module scope every app that
 * imported it paid for both — permits, observations, workers and object types it would never render.
 *
 * Nothing here is a default. If a surface shows demo numbers it is because it asked for them on this
 * path, which is also how you can tell at a glance which surfaces are still demos.
 */

/** The 24 demo action types, in the shape the widget's `actions` prop takes. */
export const DEMO_ACTIONS: readonly StateMachineAction[] = WC3_ACTION_TYPES.map((at) => ({
	id: at.id,
	label: at.displayName,
}));

/**
 * The permit engine's effect vocabulary.
 *
 * A FIXTURE, not a contract — the engine's real effect set is not modelled in this repo, and only
 * `start_sla_timer` is mentioned in its own docs. Replace it when there is a real list.
 */
export const DEMO_EFFECTS: readonly StateMachineEffect[] = [
	{id: "start_sla_timer", label: "start_sla_timer", note: "Begins this state's SLA clock on the permit."},
	{id: "stop_sla_timer", label: "stop_sla_timer", note: "Stops any running SLA clock."},
	{id: "notify_receiver", label: "notify_receiver", note: "Notifies the permit's receiver."},
	{id: "notify_issuer", label: "notify_issuer", note: "Notifies the issuing authority."},
	{id: "lock_answers", label: "lock_answers", note: "Freezes the permit's answers against further edits."},
	{id: "unlock_answers", label: "unlock_answers", note: "Reopens the permit's answers for editing."},
	{id: "write_audit_entry", label: "write_audit_entry", note: "Writes an extra audit line beyond the implicit one."},
];

/**
 * The demo token rows for a process, looked up by backing object type.
 *
 * Two datasets exist — `ot_permit` and `ot_observation` — so anything else yields an empty list,
 * which is exactly what a real process used to get with no way to say otherwise.
 */
export const demoInstancesFor = (process: Wc3ProcessRecord): readonly Wc3ProcessInstanceRow[] => demoInstances(process);

export type {StateMachineAction, StateMachineEffect, StateMachineFlagOption};
