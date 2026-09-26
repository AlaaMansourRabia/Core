/**
 * Avoid unclear or abstract icons.
 */
import {CatalogueViewToggle, CatalogueViewToggleItem} from "@corensystem/coren-ui/catalogue-view-toggle";
import {Circle, Square} from "lucide-react";

export function IconDont() {
	return (
		<CatalogueViewToggle defaultValue="a">
			<CatalogueViewToggleItem value="a">
				<Circle className="wwc:h-4 wwc:w-4" />
			</CatalogueViewToggleItem>
			<CatalogueViewToggleItem value="b">
				<Square className="wwc:h-4 wwc:w-4" />
			</CatalogueViewToggleItem>
		</CatalogueViewToggle>
	);
}
