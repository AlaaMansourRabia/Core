/**
 * Property list with grouped sections.
 */
import {PropertyList, PropertyGroup, PropertyItem} from "@corensystem/coren-ui/property-list";

export function WithGroups() {
	return (
		<PropertyList>
			<PropertyGroup title="Personal Information">
				<PropertyItem label="Name">John Doe</PropertyItem>
				<PropertyItem label="Email">john@example.com</PropertyItem>
			</PropertyGroup>
			<PropertyGroup title="Account Details">
				<PropertyItem label="Plan">Pro</PropertyItem>
				<PropertyItem label="Member since">January 2023</PropertyItem>
			</PropertyGroup>
		</PropertyList>
	);
}
