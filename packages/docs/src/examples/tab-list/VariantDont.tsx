/**
 * Avoid pills variant for primary navigation.
 */
import {TabList} from "@corensystem/coren-ui/tab-list";

export function VariantDont() {
	return (
		<TabList
			variant="pills"
			items={[
				{value: "home", label: "Home"},
				{value: "products", label: "Products"},
				{value: "about", label: "About"},
			]}
			defaultValue="home"
		/>
	);
}
