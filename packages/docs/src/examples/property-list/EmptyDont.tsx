/**
 * Avoid showing blank values.
 */
import {PropertyList, PropertyItem} from "@corensystem/coren-ui/property-list";

export function EmptyDont() {
	return (
		<PropertyList>
			<PropertyItem label="Name">John Doe</PropertyItem>
			<PropertyItem label="Phone">{/* Empty - confusing */}</PropertyItem>
			<PropertyItem label="Address">{""}</PropertyItem>
		</PropertyList>
	);
}
