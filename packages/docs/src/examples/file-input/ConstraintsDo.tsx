/**
 * Clearly communicate file requirements upfront.
 */
import {FileInput} from "@corensystem/coren-ui/file-input";

export function ConstraintsDo() {
	return (
		<FileInput
			id="file-input-constraints-do"
			accept="image/png,image/jpeg"
			maxSize={2 * 1024 * 1024}
			placeholder="PNG or JPEG images, max 2MB"
			helperText="Accepted formats: PNG, JPEG. Maximum size: 2MB"
		/>
	);
}
