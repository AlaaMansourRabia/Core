/**
 * Empty state for no search results.
 */
import {Empty} from "@corensystem/coren-ui/empty";
import {Search} from "lucide-react";

export function SearchEmpty() {
	return (
		<Empty
			icon={<Search className="wwc:h-12 wwc:w-12" />}
			title="No results found"
			description="Try adjusting your search terms or filters."
		/>
	);
}
