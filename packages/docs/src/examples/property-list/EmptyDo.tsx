/**
 * Handle empty values gracefully.
 */
import {PropertyList, PropertyItem} from "@corensystem/coren-ui/property-list";

export function EmptyDo() {
	return (
		<PropertyList>
			<PropertyItem label="Name">John Doe</PropertyItem>
			<PropertyItem label="Phone" empty="Not provided" />
			<PropertyItem label="Address" empty="—" />
		</PropertyList>
	);
}
