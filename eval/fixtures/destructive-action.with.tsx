import {Button} from "@core/core-ui/button";

export function DeleteRecordButton({onDelete}) {
	return (
		<Button variant="destructive" onClick={onDelete}>
			Delete record
		</Button>
	);
}
