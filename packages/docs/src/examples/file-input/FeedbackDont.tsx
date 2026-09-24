/**
 * Avoid hiding upload status from users.
 */
import {FileInput} from "@corensystem/coren-ui/file-input";

export function FeedbackDont() {
	return (
		<FileInput
			id="file-input-feedback-dont"
			showProgress={false}
			showFileList={false}
		/>
	);
}
