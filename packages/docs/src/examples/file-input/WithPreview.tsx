/**
 * File input with image preview functionality.
 */
import {FileInput} from "@corensystem/coren-ui/file-input";

export function WithPreview() {
	return (
		<FileInput
			id="file-input-preview"
			accept="image/*"
			showPreview
			placeholder="Drop an image here"
		/>
	);
}
