/**
 * Avoid misaligned values.
 */
import {PropertyList, PropertyItem} from "@corensystem/coren-ui/property-list";

export function AlignmentDont() {
	return (
		<PropertyList>
			<PropertyItem label="N">John Doe</PropertyItem>
			<PropertyItem label="Electronic Mail Address">john@example.com</PropertyItem>
			<PropertyItem label="Dept">Engineering</PropertyItem>
		</PropertyList>
	);
}
