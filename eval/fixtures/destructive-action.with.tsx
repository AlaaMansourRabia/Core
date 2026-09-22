import {Button} from "@corensystem/core-ui/button";

export function DeleteRecordButton({onDelete}) {
	return (
		<Button variant="destructive" onClick={onDelete}>
			Delete record
		</Button>
	);
}
