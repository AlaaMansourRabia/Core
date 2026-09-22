import {Box, FileText, Package, Share2, Sigma, Table2, Workflow, Zap} from "lucide-react";

import type {FileSystemFileType} from "../file-system";

// What a "file" means in Core Connect: the product's own record kinds, declared for the file system
// widget, which knows none of them.
//
// The tints use the library's existing soft formula — a 10% fill with a colour that darkens in light
// mode and lightens in dark, the same pair Badge's `*Soft` variants use — so these sit beside the rest
// of the system rather than introducing a second way to tint something. The hues are chosen to be
// separable at 16px: blue / violet / emerald / amber / rose / cyan / teal are far enough apart to tell
// without reading, and `doc` is deliberately neutral because a document is the type with no app behind
// it, so a hue would promise a destination it does not have.
//
// `app` is what makes a type CREATABLE as a record: a type naming one is understood to create a record
// there, and the create dialog says so before the reader commits.

export const WC3_FILE_TYPES: FileSystemFileType[] = [
	{
		id: "pipeline",
		label: "Pipeline",
		icon: Share2,
		tone: "wwc:bg-blue-500/10 wwc:text-blue-700 wwc:dark:text-blue-400",
		app: "Pipelines",
	},
	{
		id: "process",
		label: "Process",
		icon: Workflow,
		tone: "wwc:bg-violet-500/10 wwc:text-violet-700 wwc:dark:text-violet-400",
		app: "Processes",
	},
	{
		id: "object-type",
		label: "Object type",
		icon: Box,
		tone: "wwc:bg-emerald-500/10 wwc:text-emerald-700 wwc:dark:text-emerald-400",
		app: "Ontology",
	},
	{
		id: "action-type",
		label: "Action type",
		icon: Zap,
		tone: "wwc:bg-amber-500/10 wwc:text-amber-700 wwc:dark:text-amber-500",
		app: "Ontology",
	},
	{
		id: "dataset",
		label: "Dataset",
		icon: Table2,
		tone: "wwc:bg-teal-500/10 wwc:text-teal-700 wwc:dark:text-teal-400",
	},
	{id: "doc", label: "Document", icon: FileText},
];

/** Types the file system may CREATE, in the order a workspace tends to gain one. */
export const WC3_CREATABLE_FILE_TYPES = WC3_FILE_TYPES;

/** Types that exist in the fixture but are not offered in the New menu — nothing creates one here. */
export const WC3_EXTRA_FILE_TYPES: FileSystemFileType[] = [
	{
		id: "product",
		label: "Product",
		icon: Package,
		tone: "wwc:bg-rose-500/10 wwc:text-rose-700 wwc:dark:text-rose-400",
	},
	{
		id: "analysis",
		label: "Analysis",
		icon: Sigma,
		tone: "wwc:bg-cyan-500/10 wwc:text-cyan-700 wwc:dark:text-cyan-400",
	},
];

/** Every type the file system can RENDER — creatable or not. */
export const WC3_ALL_FILE_TYPES = [...WC3_FILE_TYPES, ...WC3_EXTRA_FILE_TYPES];

/** The address a WC3 file carries: which perspective and tab own the record, and its id there. */
export type Wc3FsRef = {perspectiveId: string; tabId?: string; recordId: string};

export function isWc3Ref(ref: unknown): ref is Wc3FsRef {
	return typeof ref === "object" && ref !== null && "recordId" in ref && "perspectiveId" in ref;
}
