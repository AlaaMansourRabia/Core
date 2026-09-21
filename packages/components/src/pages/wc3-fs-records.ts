import type {Wc3FsRef} from "./wc3-fs-types";
import type {Wc3ActionType, Wc3ObjectType} from "./wc3-ontology-data";

// Minimal records, built from a name.
//
// Creating a "Pipeline" in the file system has to put a real pipeline in the Pipelines perspective —
// otherwise the file is a label for something that does not exist, and clicking it can only apologise.
// So the file system's create flow asks for a name, the owning app's own constructor builds the
// record, and the file is filed with a `ref` to it. One thing, addressed twice.
//
// Pipelines and processes already had constructors worth reusing (`createPipeline`, `createProcess` in
// their shared modules). Object and action types did not — their only builder takes a full wizard
// draft — so the two below are the name-only equivalents, filling every required field with the
// emptiest legal value rather than a plausible-looking one. A type created here is deliberately bare:
// it is a starting point the Ontology app then edits, not a fixture pretending to be configured.

/** Which perspective and tab a file type's record lives in. `undefined` = no app owns this type. */
export const FILE_TYPE_TARGET: Partial<Record<string, {perspectiveId: string; tabId: string}>> = {
	pipeline: {perspectiveId: "pipelines", tabId: "pipelines"},
	process: {perspectiveId: "processes", tabId: "processes"},
	"object-type": {perspectiveId: "ontology", tabId: "object-types"},
	"action-type": {perspectiveId: "ontology", tabId: "action-types"},
};

/** True when creating this type should also create a record — the file system asks before it offers. */
export function fsTypeHasApp(type: string): boolean {
	return FILE_TYPE_TARGET[type] !== undefined;
}

const APP_LABEL: Partial<Record<string, string>> = {
	pipeline: "Pipelines",
	process: "Processes",
	"object-type": "Ontology",
	"action-type": "Ontology",
};

/** The perspective a type's record lives in, named — so a dialog can say where it is about to put it. */
export function fsTypeApp(type: string): string | undefined {
	return APP_LABEL[type];
}

export function fsRefFor(type: string, recordId: string): Wc3FsRef | undefined {
	const target = FILE_TYPE_TARGET[type];
	return target ? {...target, recordId} : undefined;
}

/** `Display Name` → `display_name`, the api-name convention the seeded types follow. */
function toApiName(name: string): string {
	return (
		name
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, "_")
			.replace(/^_+|_+$/g, "") || "untitled"
	);
}

let created = 0;

export function createObjectTypeNamed(displayName: string): Wc3ObjectType {
	const id = `ot_new_${++created}`;
	const apiName = toApiName(displayName);
	return {
		id,
		// A real RID is minted server-side; this is the prototype's client-side stand-in, the same one
		// the wizard's own constructor uses.
		rid: `ri.ontology.main.object-type.${id}`,
		apiName,
		displayName,
		pluralName: `${displayName}s`,
		description: "",
		icon: "layers",
		color: "#64748b",
		status: "Experimental",
		visibility: "Normal",
		module: "wc3-core-demo",
		layer: null,
		// No datasource yet, so no property can be a key: an empty key is honest, and the Health tab
		// already reports a type without one.
		primaryKey: [],
		titleKey: "",
		groups: [],
		properties: [],
		datasources: [],
		implements: [],
		indexStatus: {state: "Not indexed", lastSync: "—", rows: 0},
		permissions: {owners: [], editors: [], viewers: []},
	};
}

export function createActionTypeNamed(displayName: string): Wc3ActionType {
	const id = `at_new_${++created}`;
	return {
		id,
		rid: `ri.ontology.main.action-type.${id}`,
		apiName: toApiName(displayName),
		displayName,
		description: "",
		status: "Experimental",
		parameters: [],
		rules: [],
		submissionCriteria: null,
		sideEffects: {notifications: [], webhooks: []},
		formLayout: null,
		permissions: {view: [], run: []},
	};
}
