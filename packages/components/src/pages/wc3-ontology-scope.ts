import {
	WC3_ACTION_TYPES,
	WC3_INTERFACES,
	WC3_LINK_TYPES,
	WC3_OBJECT_TYPES,
	WC3_SHARED_PROPERTIES,
	WC3_TYPE_GROUPS,
	type Wc3ActionType,
	type Wc3Interface,
	type Wc3LinkType,
	type Wc3ObjectType,
	type Wc3SharedProperty,
	type Wc3TypeGroup,
	interfaceImplementors,
	sharedPropertyConsumers,
} from "./wc3-ontology-data";

// The whole scoping contract for the ontology surfaces. Pure functions over the admin fixtures — no
// React, no JSX — so the views and a product template's SideMenu counts read one derivation. It
// imports ONLY from ./wc3-ontology-data, so there is no cycle with wc3-ontology-views.tsx /
// wc3-shared-property-view.tsx.

/**
 * One product's slice of the ontology, named by the object types that product owns. Everything else
 * — links, actions, interfaces, shared properties, groups — is DERIVED from it, so a scope is never
 * maintained per tab.
 *
 * `undefined` means the whole ontology: that is the administrator (core-wc3-workspace.tsx), and
 * every helper below returns its input array BY REFERENCE in that case, so an unscoped view renders
 * exactly what it renders today.
 *
 * Hoist the object to module scope in the consumer — the views memoise on its identity.
 */
export type OntologyScope = {
	/** In-scope object type ids, e.g. ["ot_worker", "ot_crew"]. */
	objectTypeIds: readonly string[];
};

// One Set per scope object, so a helper called from several memos does not rebuild it.
const ID_SETS = new WeakMap<OntologyScope, Set<string>>();

function idsOf(scope: OntologyScope) {
	let ids = ID_SETS.get(scope);
	if (!ids) {
		ids = new Set(scope.objectTypeIds);
		ID_SETS.set(scope, ids);
	}
	return ids;
}

export function scopeObjectTypes(types: Wc3ObjectType[], scope?: OntologyScope): Wc3ObjectType[] {
	if (!scope) return types;
	const ids = idsOf(scope);
	return types.filter((o) => ids.has(o.id));
}

/**
 * BOTH endpoints must be in scope. "Either endpoint" would keep 24 of 25 and paint an Object type
 * A/B chip for a type the product's own Object types tab does not list, and its detail page would
 * open on that type — exactly the leak this rule exists to prevent. Both-ends keeps 17 of 25.
 */
export function scopeLinkTypes(links: Wc3LinkType[], scope?: OntologyScope): Wc3LinkType[] {
	if (!scope) return links;
	const ids = idsOf(scope);
	return links.filter((l) => ids.has(l.sideA.objectTypeId) && ids.has(l.sideB.objectTypeId));
}

/**
 * Every object type an action touches. Three paths, because the store has no single field:
 * array rule `objectTypeId`, array rule `linkTypeId` expanded through both of that link's sides, and
 * `objectRef` parameters. `linkTypeId` and `parameters[].objectTypeId` arrive via index signatures
 * (Wc3ActionRule / Wc3ActionType.parameters), so they are `unknown` and are narrowed by typeof.
 */
export function actionObjectTypeIds(action: Wc3ActionType, linkTypes: Wc3LinkType[] = WC3_LINK_TYPES): Set<string> {
	const out = new Set<string>();
	const rules = Array.isArray(action.rules) ? action.rules : [];
	for (const rule of rules) {
		if (rule.objectTypeId) out.add(rule.objectTypeId);
		if (typeof rule.linkTypeId === "string") {
			const link = linkTypes.find((l) => l.id === rule.linkTypeId);
			if (link) {
				out.add(link.sideA.objectTypeId);
				out.add(link.sideB.objectTypeId);
			}
		}
	}
	for (const parameter of action.parameters) {
		if (typeof parameter.objectTypeId === "string") out.add(parameter.objectTypeId);
	}
	return out;
}

/**
 * An action is in scope when it touches at least one object type and EVERY type it touches is in
 * scope. "Any type in scope" would admit at_reassign_sensor (it also touches ot_worker) and its
 * detail page would then expose a Sensor objectRef parameter. Strict keeps 20 of 24; the four
 * dropped are at_reassign_sensor, at_update_install_status, at_verify_element_qty and
 * at_reassess_zone_risk — the last is a function rule with one string parameter, so it resolves to
 * no object type at all and is dropped by the non-empty guard.
 */
export function scopeActionTypes(
	actions: Wc3ActionType[],
	scope?: OntologyScope,
	linkTypes: Wc3LinkType[] = WC3_LINK_TYPES,
): Wc3ActionType[] {
	if (!scope) return actions;
	const ids = idsOf(scope);
	return actions.filter((a) => {
		const touched = actionObjectTypeIds(a, linkTypes);
		return touched.size > 0 && [...touched].every((id) => ids.has(id));
	});
}

/** interfaceImplementors is the only extends-aware resolution — wrap it, never re-walk `extends`. */
export function scopedInterfaceImplementors(interfaceId: string, scope?: OntologyScope): Wc3ObjectType[] {
	const all = interfaceImplementors(interfaceId);
	if (!scope) return all;
	const ids = idsOf(scope);
	return all.filter((o) => ids.has(o.id));
}

/** An interface survives while at least one in-scope object type implements it (4 of 4 for Workforce). */
export function scopeInterfaces(interfaces: Wc3Interface[], scope?: OntologyScope): Wc3Interface[] {
	if (!scope) return interfaces;
	return interfaces.filter((i) => scopedInterfaceImplementors(i.id, scope).length > 0);
}

/** A shared property survives while at least one in-scope object type consumes it (5 of 6; sp_uniclass_code drops). */
export function scopeSharedProperties(properties: Wc3SharedProperty[], scope?: OntologyScope): Wc3SharedProperty[] {
	if (!scope) return properties;
	const ids = idsOf(scope);
	return properties.filter((s) => sharedPropertyConsumers(s.id).some((o) => ids.has(o.id)));
}

/** Narrow the members first, then drop groups left empty (5 of 5 for Workforce; g_assets falls to one member). */
export function scopeTypeGroups(groups: Wc3TypeGroup[], scope?: OntologyScope): Wc3TypeGroup[] {
	if (!scope) return groups;
	const ids = idsOf(scope);
	return groups.map((g) => ({...g, members: g.members.filter((m) => ids.has(m))})).filter((g) => g.members.length > 0);
}

/**
 * Row counts keyed by the Settings item ids, so a SideMenu badge cannot drift from its table.
 * Keys are the Settings ids ("type-groups"), not the admin registry keys ("groups").
 */
export function ontologyScopeCounts(scope?: OntologyScope) {
	return {
		"object-types": scopeObjectTypes(WC3_OBJECT_TYPES, scope).length,
		"link-types": scopeLinkTypes(WC3_LINK_TYPES, scope).length,
		"action-types": scopeActionTypes(WC3_ACTION_TYPES, scope).length,
		interfaces: scopeInterfaces(WC3_INTERFACES, scope).length,
		"shared-properties": scopeSharedProperties(WC3_SHARED_PROPERTIES, scope).length,
		"type-groups": scopeTypeGroups(WC3_TYPE_GROUPS, scope).length,
	};
}
