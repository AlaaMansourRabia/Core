/**
 * Avoid resetting view on every visit.
 */
import {CatalogueViewToggle, CatalogueViewToggleItem} from "@corensystem/coren-ui/catalogue-view-toggle";
import {Grid, List} from "lucide-react";

export function PersistDont() {
	return (
		<CatalogueViewToggle defaultValue="grid">
			<CatalogueViewToggleItem value="grid"><Grid className="wwc:h-4 wwc:w-4" /></CatalogueViewToggleItem>
			<CatalogueViewToggleItem value="list"><List className="wwc:h-4 wwc:w-4" /></CatalogueViewToggleItem>
		</CatalogueViewToggle>
	);
}
