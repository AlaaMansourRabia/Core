/**
 * Horizontal property list layout.
 */
import {PropertyList, PropertyItem} from "@corensystem/coren-ui/property-list";

export function Horizontal() {
	return (
		<PropertyList orientation="horizontal">
			<PropertyItem label="Status">Active</PropertyItem>
			<PropertyItem label="Created">Jan 15, 2024</PropertyItem>
			<PropertyItem label="Updated">2 hours ago</PropertyItem>
		</PropertyList>
	);
}
