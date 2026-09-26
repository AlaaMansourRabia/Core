/**
 * Remember user's view preference.
 */
import {CatalogueViewToggle, CatalogueViewToggleItem} from "@corensystem/coren-ui/catalogue-view-toggle";
import {Grid, List} from "lucide-react";

export function PersistDo() {
	return (
		<CatalogueViewToggle defaultValue="list" persist="catalogue-view">
			<CatalogueViewToggleItem value="grid"><Grid className="wwc:h-4 wwc:w-4" /></CatalogueViewToggleItem>
			<CatalogueViewToggleItem value="list"><List className="wwc:h-4 wwc:w-4" /></CatalogueViewToggleItem>
		</CatalogueViewToggle>
	);
}
