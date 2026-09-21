import {cn} from "@wakecap/core-utils";

// A path, truncated at the LAST separator rather than at a character count: the folder a record sits
// in is the only segment that identifies it, so that half is pinned and the ancestors give way.
// "/Falcon Heights Medical Tower/Data pipelines" in a narrow column reads "…/Data pipelines", never
// "/Falcon Heights …".

export function FileSystemPathText({path, className}: {path: string; className?: string}) {
	const cut = path.lastIndexOf("/");
	const head = cut > 0 ? path.slice(0, cut) : "";
	const tail = cut > 0 ? path.slice(cut) : path;
	return (
		<span className={cn("wwc:flex wwc:min-w-0 wwc:items-center wwc:overflow-hidden wwc:font-mono", className)}>
			{/* `whitespace-pre`, not `truncate`: these are two flex items and `truncate`'s nowrap collapses
			    a space at the boundary, so "Built assets" would read "Builtassets". */}
			{head && <span className="wwc:min-w-0 wwc:overflow-hidden wwc:text-ellipsis wwc:whitespace-pre">{head}</span>}
			<span className="wwc:shrink-0 wwc:whitespace-pre">{tail}</span>
		</span>
	);
}
