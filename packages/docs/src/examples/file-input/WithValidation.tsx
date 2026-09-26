/**
 * File input with size and type validation.
 */
import {FileInput} from "@corensystem/coren-ui/file-input";

export function WithValidation() {
	return (
		<FileInput
			id="file-input-validation"
			accept=".pdf,.doc,.docx"
			maxSize={5 * 1024 * 1024}
			placeholder="PDF or Word documents only (max 5MB)"
		/>
	);
}
