/**
 * Provide clear labeling for file inputs.
 */
import {FileInput} from "@corensystem/coren-ui/file-input";
import {Label} from "@corensystem/coren-ui/label";

export function AccessibleDo() {
	return (
		<div className="wwc:grid wwc:gap-1.5">
			<Label htmlFor="file-input-accessible-do">Upload resume</Label>
			<FileInput id="file-input-accessible-do" accept=".pdf,.doc,.docx" aria-describedby="file-input-hint" />
			<p id="file-input-hint" className="wwc:text-sm wwc:text-muted-foreground">
				PDF or Word document required
			</p>
		</div>
	);
}
