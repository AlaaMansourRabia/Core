import type {Meta, StoryObj} from "storybook/internal/types";

import {Code, CodeBlock} from "@corensystem/core-ui/code";

const meta = {
	title: "Components/Primitives/Code",
	component: Code,
	tags: ["autodocs"],
} satisfies Meta<typeof Code>;

export default meta;
type Story = StoryObj<typeof meta>;

export const InlineCode: Story = {
	render: () => (
		<p className="wwc:text-sm">
			Use the <Code>npm install</Code> command to install dependencies.
		</p>
	),
};

export const InlineCodeVariants: Story = {
	render: () => (
		<div className="wwc:flex wwc:flex-col wwc:gap-2">
			<div>
				Default: <Code variant="default">const x = 42;</Code>
			</div>
			<div>
				Outline: <Code variant="outline">const x = 42;</Code>
			</div>
		</div>
	),
};

export const Block: Story = {
	render: () => (
		<CodeBlock>
			{`function greet(name) {
  console.log(\`Hello, \${name}!\`);
  return true;
}`}
		</CodeBlock>
	),
};

export const MultilineBlock: Story = {
	render: () => (
		<CodeBlock>
			{`import React from 'react';
import { Button } from '@corensystem/core-ui/button';

export function MyComponent() {
  const [count, setCount] = React.useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <Button onClick={() => setCount(count + 1)}>
        Increment
      </Button>
    </div>
  );
}`}
		</CodeBlock>
	),
};
