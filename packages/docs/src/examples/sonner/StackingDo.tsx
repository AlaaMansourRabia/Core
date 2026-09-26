/**
 * Limit toast stacking to avoid overwhelming users.
 */
import {Button} from "@corensystem/coren-ui/button";
import {toast} from "sonner";

export function StackingDo() {
	const handleBatchAction = () => {
		// Single summary toast for batch actions
		toast.success("5 files uploaded successfully");
	};

	return <Button onClick={handleBatchAction}>Upload 5 Files</Button>;
}
