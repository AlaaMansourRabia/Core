// Metric: correct provider wiring.
// A component with a non-empty `requires` in library-index.json needs an ancestor
// provider (or a hook) present, or it throws / no-ops at runtime. The catalog is the
// source of truth for WHICH components need wiring; the per-family detection below
// (extra trigger tags, how to spot the provider) is curated and traced to an fm-* id.

import {callsFn, finding, stripComments, usesJsx} from "./util.mjs";

const METRIC = "provider-wiring";

// Per-component detection overrides keyed by catalog component name.
//   triggers        — JSX tags / call names that imply the component family is in use
//   satisfied(code) — is the required provider/hook present in the snippet?
//   source/fix      — fm-* reference + the actionable fix
const DETECTION = {
	Tooltip: {
		triggers: ["Tooltip", "TooltipTrigger", "TooltipContent"],
		satisfied: (code) => usesJsx(code, "TooltipProvider"),
		source: "fm-prim-2",
		fix: "Wrap the subtree (e.g. the app shell) in a single <TooltipProvider>.",
	},
	Sidebar: {
		triggers: ["Sidebar", "SidebarTrigger", "SidebarContent", "SidebarMenu", "SidebarHeader", "SidebarFooter"],
		satisfied: (code) => usesJsx(code, "SidebarProvider"),
		source: "fm-prim-3",
		fix: "Mount <SidebarProvider> at the root layout, wrapping the sidebar and <main>.",
	},
	Field: {
		triggers: ["FormField", "FormItem", "FormControl", "FormLabel", "FormMessage", "FormDescription"],
		satisfied: (code) => usesJsx(code, "Form"),
		source: "fm-form-2",
		fix: "Wrap the fields in <Form {...form}> (the FormProvider) so useFormContext() resolves.",
	},
	Toast: {
		triggers: ["Toast", "toast"],
		satisfied: (code) => usesJsx(code, "Toaster"),
		source: "library-index.json#Toast.requires",
		fix: "Mount a single <Toaster /> at the app root so toasts have somewhere to render.",
	},
	Sonner: {
		triggers: ["Sonner", "toast"],
		satisfied: (code) => usesJsx(code, "Toaster"),
		source: "library-index.json#Sonner.requires",
		fix: "Mount a single <Toaster /> (Sonner) at the app root.",
	},
};

// Uppercase trigger → a JSX component tag; lowercase → a function call (e.g. toast()).
function familyUsed(code, triggers) {
	return triggers.some((t) => (/^[A-Z]/.test(t) ? usesJsx(code, t) : callsFn(code, t)));
}

/**
 * @param {string} code
 * @param {import("./load.mjs").Catalog} catalog
 * @returns {import("./util.mjs").Finding[]}
 */
export function validateProviders(code, catalog) {
	const clean = stripComments(code);
	const findings = [];

	for (const {component, requires} of catalog.requires) {
		// Form→useForm is a hook-call requirement that isn't reliably visible in a
		// snippet (forms commonly spread a `{...form}` prop created elsewhere), so we
		// don't enforce it here. The high-value Field→Form (fm-form-2) check remains.
		if (component === "Form") continue;
		const det = DETECTION[component];
		const triggers = det?.triggers ?? [component];
		if (!familyUsed(clean, triggers)) continue;

		const satisfied = det ? det.satisfied(clean) : usesJsx(clean, requires[0]) || callsFn(clean, requires[0]);
		if (!satisfied) {
			findings.push(
				finding(
					METRIC,
					false,
					`${component} is used without its required ${requires.join("/")}.`,
					det?.fix ?? `Provide ${requires.join("/")} as an ancestor.`,
					det?.source ?? `library-index.json#${component}.requires`,
				),
			);
		}
	}

	if (findings.length === 0) {
		findings.push(
			finding(
				METRIC,
				true,
				"All provider-requiring components have their required wiring present.",
				"",
				"library-index.json#requires",
			),
		);
	}
	return findings;
}
