// The count that sits next to each sidebar section header — "Components 113", "Design Tokens 5".
//
// Wired through `sidebar.renderLabel` in manager.ts, which Storybook calls for every tree node
// (root headings included — see the `item.type === "root"` branch of its Tree renderer). We render
// the count for roots only and hand every other node its plain name back.
//
// What gets counted is what a person would point at in the sidebar: one per page you can open, not
// one per story variant. A `component` node counts once (its children are that component's stories
// plus its autodocs page), a standalone `docs` page counts once, and `group` nodes just recurse.

import * as React from "react";
import {useStorybookState} from "storybook/manager-api";

type Node = {type?: string; children?: readonly string[]};
type Index = Record<string, Node>;

export function countSectionItems(index: Index, id: string): number {
	const node = index[id];
	if (!node?.children) return 0;

	let total = 0;
	for (const childId of node.children) {
		const child = index[childId];
		if (!child) continue;
		// Stop at components: descending would count each variant, and their autodocs page twice.
		if (child.type === "component" || child.type === "docs") total += 1;
		else if (child.type === "group") total += countSectionItems(index, childId);
	}
	return total;
}

// The sections that exist in the IA but have nothing in them yet — each holds a single placeholder
// Overview (docs/STORYBOOK-IA.md §5). A count of "1" there promises content that is not there, so
// they get a "Soon" badge instead. Drop an id from this set the moment its section ships.
const PLACEHOLDER_ROOTS = new Set(["knowledge", "evaluation", "visual-proof"]);

// The manager bundle compiles JSX with the classic runtime, so `React` must be in scope here —
// a named `useMemo` import alone throws "React is not defined" at render. Same as chat/ChatDock.tsx.

// Muted, small, tabular — reads as metadata beside the heading, never competes with it. Inline so it
// survives the emotion styles Storybook layers on the heading (letter-spacing included).
const countStyle: React.CSSProperties = {
	marginLeft: 8,
	fontSize: 11,
	fontWeight: 500,
	letterSpacing: "normal",
	textTransform: "none",
	fontVariantNumeric: "tabular-nums",
	color: "#a8a29e",
};

// The core-ui Badge, `neutralSoft` variant, rebuilt by hand: the manager iframe never loads
// @corensystem/core-ui's stylesheet (importing it would reset Storybook's own chrome), so the token
// values are written out literally — same approach as chat/ChatDock.tsx.
const soonBadgeStyle: React.CSSProperties = {
	marginLeft: 8,
	display: "inline-flex",
	alignItems: "center",
	borderRadius: 6,
	border: "1px solid #e7e5e4",
	background: "#f5f5f4",
	color: "#78716c",
	fontSize: 10,
	fontWeight: 600,
	lineHeight: "16px",
	padding: "0 6px",
	letterSpacing: "normal",
	textTransform: "none",
};

export function RootLabelWithCount({item}: {item: {id: string; name: string}}) {
	const {index} = useStorybookState();
	const count = React.useMemo(() => (index ? countSectionItems(index as Index, item.id) : 0), [index, item.id]);

	if (PLACEHOLDER_ROOTS.has(item.id)) {
		return (
			<>
				{item.name}
				<span style={soonBadgeStyle}>Soon</span>
			</>
		);
	}

	return (
		<>
			{item.name}
			{count > 0 && <span style={countStyle}>{count}</span>}
		</>
	);
}
