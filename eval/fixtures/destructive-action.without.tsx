import {Button} from "@wakecap/core-ui";

export function DeleteRecordButton({onDelete}) {
	return (
		<Button className="bg-red-500" onClick={onDelete}>
			Delete record
		</Button>
	);
}
