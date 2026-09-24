/**
 * Provide clear guidance on what to do next.
 */
import {Empty} from "@corensystem/coren-ui/empty";
import {Button} from "@corensystem/coren-ui/button";
import {FolderOpen, Upload, Link} from "lucide-react";

export function GuidanceDo() {
	return (
		<Empty
			icon={<FolderOpen className="wwc:h-12 wwc:w-12" />}
			title="No files yet"
			description="Upload files or connect to cloud storage to get started."
		>
			<div className="wwc:flex wwc:gap-2">
				<Button>
					<Upload className="wwc:mr-2 wwc:h-4 wwc:w-4" />
					Upload Files
				</Button>
				<Button variant="outline">
					<Link className="wwc:mr-2 wwc:h-4 wwc:w-4" />
					Connect Storage
				</Button>
			</div>
		</Empty>
	);
}
