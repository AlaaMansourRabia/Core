import {Avatar, AvatarFallback} from "@corensystem/coren-ui/avatar";
/**
 * Overflow list with avatar stack.
 */
import {OverflowList, OverflowListItem, OverflowListMore} from "@corensystem/coren-ui/overflow-list";

const users = [
	{name: "Alice", initials: "AC"},
	{name: "Bob", initials: "BS"},
	{name: "Carol", initials: "CW"},
	{name: "Dan", initials: "DB"},
	{name: "Eve", initials: "EF"},
];

export function WithAvatars() {
	return (
		<OverflowList maxVisible={3} className="wwc:flex wwc:-space-x-2">
			{users.map((user) => (
				<OverflowListItem key={user.name}>
					<Avatar className="wwc:border-2 wwc:border-background">
						<AvatarFallback>{user.initials}</AvatarFallback>
					</Avatar>
				</OverflowListItem>
			))}
			<OverflowListMore>
				{(count) => (
					<Avatar className="wwc:border-2 wwc:border-background">
						<AvatarFallback>+{count}</AvatarFallback>
					</Avatar>
				)}
			</OverflowListMore>
		</OverflowList>
	);
}
