/**
 * Avoid verbose or redundant labels.
 */
import {PropertyList, PropertyItem} from "@corensystem/coren-ui/property-list";

export function LabelsDont() {
	return (
		<PropertyList>
			<PropertyItem label="Date and time when this item was first created">January 15, 2024</PropertyItem>
			<PropertyItem label="Last modification date and time">2 hours ago</PropertyItem>
			<PropertyItem label="Total file size in megabytes">2.4 MB</PropertyItem>
		</PropertyList>
	);
}
