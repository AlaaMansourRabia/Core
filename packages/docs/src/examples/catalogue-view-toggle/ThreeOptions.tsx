/**
 * Three-option view toggle.
 */
import {CatalogueViewToggle, CatalogueViewToggleItem} from "@corensystem/coren-ui/catalogue-view-toggle";
import {Grid, List, Table2} from "lucide-react";

export function ThreeOptions() {
	return (
		<CatalogueViewToggle defaultValue="table">
			<CatalogueViewToggleItem value="grid"><Grid className="wwc:h-4 wwc:w-4" /></CatalogueViewToggleItem>
			<CatalogueViewToggleItem value="list"><List className="wwc:h-4 wwc:w-4" /></CatalogueViewToggleItem>
			<CatalogueViewToggleItem value="table"><Table2 className="wwc:h-4 wwc:w-4" /></CatalogueViewToggleItem>
		</CatalogueViewToggle>
	);
}
