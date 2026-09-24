/**
 * Show upload progress and file status.
 */
import {FileInput} from "@corensystem/coren-ui/file-input";

export function FeedbackDo() {
	return (
		<FileInput
			id="file-input-feedback-do"
			showProgress
			showFileList
			placeholder="Files will appear below with progress"
		/>
	);
}
