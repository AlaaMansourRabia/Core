import type {Meta, StoryObj} from "storybook/internal/types";

import {Markdown} from "@core/core-ui/markdown";

const meta = {
	title: "Components/Primitives/Markdown",
	component: Markdown,
	tags: ["autodocs"],
} satisfies Meta<typeof Markdown>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => (
		<Markdown>
			<h1>Heading 1</h1>
			<p>This is a paragraph with some <strong>bold text</strong> and <em>italic text</em>.</p>
			<h2>Heading 2</h2>
			<p>Here is a <a href="#">link to somewhere</a>.</p>
			<h3>Heading 3</h3>
			<ul>
				<li>First item</li>
				<li>Second item</li>
				<li>Third item</li>
			</ul>
		</Markdown>
	),
};

export const WithCode: Story = {
	render: () => (
		<Markdown>
			<p>Inline code: <code>const x = 42;</code></p>
			<pre><code>{`function hello() {
  console.log("Hello, World!");
}`}</code></pre>
		</Markdown>
	),
};

export const WithBlockquote: Story = {
	render: () => (
		<Markdown>
			<blockquote>
				<p>This is a blockquote. It can contain multiple paragraphs.</p>
				<p>Like this one.</p>
			</blockquote>
		</Markdown>
	),
};

export const WithTable: Story = {
	render: () => (
		<Markdown>
			<table>
				<thead>
					<tr>
						<th>Name</th>
						<th>Role</th>
						<th>Status</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>Alice</td>
						<td>Developer</td>
						<td>Active</td>
					</tr>
					<tr>
						<td>Bob</td>
						<td>Designer</td>
						<td>Active</td>
					</tr>
				</tbody>
			</table>
		</Markdown>
	),
};

export const Compact: Story = {
	render: () => (
		<Markdown compact>
			<h2>Compact Mode</h2>
			<p>This has tighter spacing.</p>
			<ul>
				<li>Item 1</li>
				<li>Item 2</li>
			</ul>
			<p>Better for dense content.</p>
		</Markdown>
	),
};

export const WithoutProse: Story = {
	render: () => (
		<Markdown prose={false}>
			<p>This content has no prose styling applied.</p>
			<p>Useful when you want to apply your own styles.</p>
		</Markdown>
	),
};
