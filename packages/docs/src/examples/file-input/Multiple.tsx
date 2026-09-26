/**
 * File input allowing multiple file selection.
 */
import {FileInput} from "@corensystem/coren-ui/file-input";

export function Multiple() {
	return <FileInput id="file-input-multiple" multiple maxFiles={5} placeholder="Select up to 5 files" />;
}
