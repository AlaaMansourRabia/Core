/**
 * Metric card with icon.
 */
import {MetricCard} from "@corensystem/coren-ui/metric-card";
import {DollarSign, Users, ShoppingCart} from "lucide-react";

export function WithIcon() {
	return (
		<div className="wwc:grid wwc:grid-cols-3 wwc:gap-4">
			<MetricCard
				title="Revenue"
				value="$45,231"
				icon={<DollarSign className="wwc:h-4 wwc:w-4" />}
			/>
			<MetricCard
				title="Users"
				value="2,350"
				icon={<Users className="wwc:h-4 wwc:w-4" />}
			/>
			<MetricCard
				title="Orders"
				value="1,234"
				icon={<ShoppingCart className="wwc:h-4 wwc:w-4" />}
			/>
		</div>
	);
}
