/**
 * Basic property list for displaying key-value pairs.
 */
import {PropertyList, PropertyItem} from "@corensystem/coren-ui/property-list";

export function Default() {
	return (
		<PropertyList>
			<PropertyItem label="Name">John Doe</PropertyItem>
			<PropertyItem label="Email">john@example.com</PropertyItem>
			<PropertyItem label="Role">Administrator</PropertyItem>
		</PropertyList>
	);
}
