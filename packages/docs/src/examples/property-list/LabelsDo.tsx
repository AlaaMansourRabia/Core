/**
 * Use concise, clear labels.
 */
import {PropertyList, PropertyItem} from "@corensystem/coren-ui/property-list";

export function LabelsDo() {
	return (
		<PropertyList>
			<PropertyItem label="Created">January 15, 2024</PropertyItem>
			<PropertyItem label="Modified">2 hours ago</PropertyItem>
			<PropertyItem label="Size">2.4 MB</PropertyItem>
		</PropertyList>
	);
}
