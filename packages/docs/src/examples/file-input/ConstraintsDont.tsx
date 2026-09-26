/**
 * Avoid hiding file constraints until validation fails.
 */
import {FileInput} from "@corensystem/coren-ui/file-input";

export function ConstraintsDont() {
	return (
		<FileInput
			id="file-input-constraints-dont"
			accept="image/png,image/jpeg"
			maxSize={2 * 1024 * 1024}
		/>
	);
}
