import {Badge} from "@corensystem/coren-ui/badge";
/**
 * Basic overflow list with more button.
 */
import {OverflowList, OverflowListItem, OverflowListMore} from "@corensystem/coren-ui/overflow-list";

const tags = ["React", "TypeScript", "JavaScript", "CSS", "HTML", "Node.js", "GraphQL", "REST"];

export function Default() {
	return (
		<OverflowList maxVisible={5}>
			{tags.map((tag) => (
				<OverflowListItem key={tag}>
					<Badge variant="secondary">{tag}</Badge>
				</OverflowListItem>
			))}
			<OverflowListMore>{(count) => <Badge variant="outline">+{count} more</Badge>}</OverflowListMore>
		</OverflowList>
	);
}
