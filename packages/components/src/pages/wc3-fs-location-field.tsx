import {Folder, FolderOpen} from "lucide-react";
import {useMemo} from "react";

import {fsDescendants, fsPath} from "../file-system";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "../select";
import {useWc3FsNodes, wc3FsIndex} from "./wc3-fs-store";

// "Where does this go?" — the first field of every create dialog in the Studio.
//
// A record made in Pipelines and a record made in Files are the same kind of thing, so they should end
// up equally findable. Without this, anything created inside an app had no address at all: it appeared
// in that app's list and nowhere else, and the Location column beside it stayed empty, which reads as
// a bug rather than as a choice.
//
// It asks first, not last, because the answer is cheap and the alternative is a second trip: a record
// filed after the fact has to be found again before it can be moved.

export interface Wc3FsLocationFieldProps {
	/** The organization whose folders are on offer. */
	rootId: string;
	value: string;
	onChange: (id: string) => void;
	id?: string;
}

export function Wc3FsLocationField({rootId, value, onChange, id}: Wc3FsLocationFieldProps) {
	// Subscribes, so a folder created in Files appears here without a reload.
	useWc3FsNodes();
	const index = wc3FsIndex();

	// Every project, each followed by its own folders — the order they appear in the file system, so the
	// list reads as the hierarchy it is rather than an alphabetical jumble of folder names, several of
	// which ("Safety", "Permitting") repeat across projects and mean nothing alone.
	const options = useMemo(() => {
		const out: {id: string; label: string; depth: number; isProject: boolean}[] = [];
		for (const project of index.byParent.get(rootId) ?? []) {
			if (project.kind !== "project") continue;
			out.push({id: project.id, label: project.name, depth: 0, isProject: true});
			for (const node of fsDescendants(index, project.id)) {
				if (node.kind !== "folder" || node.trashed) continue;
				out.push({
					id: node.id,
					label: node.name,
					depth: fsPath(index, node.id).split("/").length - 3,
					isProject: false,
				});
			}
		}
		return out;
	}, [index, rootId]);

	return (
		<Select value={value} onValueChange={onChange}>
			<SelectTrigger id={id}>
				<SelectValue placeholder="Choose a project or folder" />
			</SelectTrigger>
			<SelectContent>
				{options.map((option) => (
					<SelectItem key={option.id} value={option.id}>
						<span
							className="wwc:flex wwc:items-center wwc:gap-2"
							// Indent by depth so a folder reads as being INSIDE the project above it. Inline because
							// the depth is data, not one of a fixed set of classes.
							style={option.depth > 0 ? {paddingInlineStart: option.depth * 12} : undefined}
						>
							{option.isProject ? (
								<FolderOpen className="wwc:h-3.5 wwc:w-3.5 wwc:shrink-0 wwc:text-muted-foreground" />
							) : (
								<Folder className="wwc:h-3.5 wwc:w-3.5 wwc:shrink-0 wwc:text-muted-foreground" />
							)}
							{option.label}
						</span>
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}

/** The first project under a root — the default a create dialog opens with. */
export function wc3FsDefaultLocation(rootId: string): string | undefined {
	return (wc3FsIndex().byParent.get(rootId) ?? []).find((n) => n.kind === "project")?.id;
}
