/**
 * Align values consistently.
 */
import {PropertyList, PropertyItem} from "@corensystem/coren-ui/property-list";

export function AlignmentDo() {
	return (
		<PropertyList labelWidth="120px">
			<PropertyItem label="Name">John Doe</PropertyItem>
			<PropertyItem label="Email">john@example.com</PropertyItem>
			<PropertyItem label="Department">Engineering</PropertyItem>
		</PropertyList>
	);
}
