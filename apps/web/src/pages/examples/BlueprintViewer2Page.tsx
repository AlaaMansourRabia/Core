import {CopyButton} from "@/components/ui/copy-button";
import {BlueprintViewer} from "@/components/ui/pages/core-blueprint-viewer";

export function BlueprintViewer2Page() {
	return (
		<div className="wwc:space-y-6">
			<div>
				<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
					<h1 className="wwc:text-3xl wwc:font-bold">Blueprint Viewer #2</h1>
					<CopyButton
						value="Blueprint Viewer #2"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:mt-2 wwc:max-w-2xl wwc:text-muted-foreground">
					A layout variant of the Blueprint Viewer: a searchable floor navigator sits top-left, the Show Multiple toggle
					is top-center, and the zoom tools are top-right. A full-height progress panel slides in from the right.
				</p>
			</div>

			<div className="wwc:h-[720px] wwc:overflow-hidden wwc:rounded-lg wwc:border">
				<BlueprintViewer />
			</div>
		</div>
	);
}
