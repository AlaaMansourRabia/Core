---
name: core-ui-chat
description: >
  ChatWidget floating AI assistant from @core/core-ui/chat/core-chat-widget.
  Props: onAddWidget (add-to-page callback), apiEndpoint, userName. Open/minimize/
  close state is internal. ChatPanel, ChatMessage, ChatInput, ChartRenderer
  sub-components. Message/TextMessage/ChartMessage/DashboardWidget types from
  @core/core-ui/types/chat. sendChatMessage service stub from
  @core/core-ui/services/chatService — must be replaced for production use.
metadata:
  type: core
  library: core
  library_version: "0.0.1"
sources:
  - "core/Core:packages/components/src/chat/core-chat-widget.tsx"
  - "core/Core:packages/components/src/chat/core-chat-panel.tsx"
  - "core/Core:packages/components/src/chat/core-chat-message.tsx"
  - "core/Core:packages/components/src/services/chatService.ts"
  - "core/Core:packages/components/src/types/chat.ts"
---

# @core/core-ui — Chat Widget

## Setup

### Basic integration (demo/mock responses)

```tsx
import {ChatWidget} from "@core/core-ui/chat/core-chat-widget";

// Renders a floating "Core Assistant" button fixed bottom-right.
// Clicking opens the chat panel. sendChatMessage returns mock data.
export function App() {
	return (
		<div>
			{/* ...app content... */}
			<ChatWidget userName="Alaa Rabia" />
		</div>
	);
}
```

### With add-to-page callback

```tsx
import {ChatWidget} from "@core/core-ui/chat/core-chat-widget";
import type {DashboardWidget} from "@core/core-ui/types/chat";
import {useState} from "react";

export function Dashboard() {
	const [widgets, setWidgets] = useState<DashboardWidget[]>([]);

	const handleAddWidget = (widget: DashboardWidget) => {
		setWidgets((prev) => [...prev, widget]);
	};

	return (
		<div>
			{/* Render pinned widgets */}
			{widgets.map((w) => (
				<div key={w.id}>
					<h3>{w.title}</h3>
					{/* render w.chartData */}
				</div>
			))}

			<ChatWidget onAddWidget={handleAddWidget} userName="Alaa Rabia" />
		</div>
	);
}
```

### Connecting a real API backend

The bundled `sendChatMessage` is a demo stub — it ignores `apiEndpoint` and
returns mock data. To connect a real backend, wrap `ChatPanel` directly and
provide your own send handler, or replace the service at the application level:

```tsx
import {ChatPanel} from "@core/core-ui/chat/core-chat-panel";
import type {Message, DashboardWidget} from "@core/core-ui/types/chat";
import {useState} from "react";

export function CustomChatWidget() {
	const [isOpen, setIsOpen] = useState(false);
	const [isMinimized, setIsMinimized] = useState(false);
	const [messages, setMessages] = useState<Message[]>([]);
	const [isLoading, setIsLoading] = useState(false);

	const handleSend = async (content: string) => {
		setMessages((prev) => [
			...prev,
			{id: crypto.randomUUID(), role: "user", type: "text", content, timestamp: new Date()},
		]);
		setIsLoading(true);
		try {
			const res = await fetch("/api/chat", {
				method: "POST",
				body: JSON.stringify({message: content}),
				headers: {"Content-Type": "application/json"},
			});
			const data = await res.json();
			setMessages((prev) => [
				...prev,
				{id: crypto.randomUUID(), role: "assistant", type: "text", content: data.message, timestamp: new Date()},
			]);
		} finally {
			setIsLoading(false);
		}
	};

	if (!isOpen) {
		return <button onClick={() => setIsOpen(true)}>Open Assistant</button>;
	}

	return (
		<ChatPanel
			messages={messages}
			isLoading={isLoading}
			isMinimized={isMinimized}
			onClose={() => setIsOpen(false)}
			onMinimize={() => setIsMinimized(true)}
			onMaximize={() => setIsMinimized(false)}
			onSendMessage={handleSend}
			userName="Alaa Rabia"
		/>
	);
}
```

## Core Patterns

### Message type discrimination

```tsx
import type {Message, TextMessage, ChartMessage} from "@core/core-ui/types/chat";

function processMessage(message: Message) {
	if (message.type === "text") {
		// message is TextMessage — has .content: string
		console.log(message.content);
	}

	if (message.type === "chart") {
		// message is ChartMessage — has .chartData: ChartData
		console.log(message.chartData.chartType);
		console.log(message.chartData.title);
	}
}
```

### DashboardWidget structure from onAddWidget

```tsx
import type {DashboardWidget} from "@core/core-ui/types/chat";

// Widget created when user clicks "Add to Page" on a chart message
const widget: DashboardWidget = {
	id: "abc123",
	title: "Weekly Workforce Distribution",
	chartData: {
		chartType: "bar",
		data: [{name: "Week 1", workers: 120}],
		config: {workers: {label: "Workers", color: "#d99447"}},
		xAxisKey: "name",
		dataKeys: ["workers"],
	},
	targetTab: "performance", // which tab this widget belongs to
	addedAt: new Date(),
};
```

## Common Mistakes

### HIGH apiEndpoint prop does not connect to a real backend

Wrong:

```tsx
// apiEndpoint is passed but the bundled service ignores it
<ChatWidget apiEndpoint="https://api.example.com/chat" userName="Demo" />
```

Correct:

```tsx
// Use ChatPanel directly with a custom onSendMessage handler (see Setup above)
// The bundled sendChatMessage is a demo stub — apiEndpoint has no effect on it
```

`ChatWidget` passes `apiEndpoint` to `sendChatMessage` but the function signature
is `async function sendChatMessage(_content: string, _apiEndpoint?: string)` —
both parameters are prefixed `_` and ignored. The function always returns one of
two hardcoded mock responses. There is no error.

Source: `packages/components/src/services/chatService.ts:13`

---

### HIGH Accessing message.chart instead of message.chartData

Wrong:

```tsx
if (message.type === "chart") {
	const data = message.chart; // undefined — wrong field
	renderChart(data);
}
```

Correct:

```tsx
if (message.type === "chart") {
	const data = message.chartData; // correct
	renderChart(data);
}
```

`ChartMessage` has both a `chart?: ChartData` field (optional, not populated
by `ChatWidget`) and a `chartData: ChartData` field (always set). The rendered
`ChatMessage` component and `ChartRenderer` both read `chartData`. Accessing
`chart` returns `undefined` silently.

Source: `packages/components/src/types/chat.ts:36`

---

### MEDIUM ChartRenderer inside ChatMessage requires pie data with "name"/"value" keys

Wrong:

```tsx
// Pie chart data in a ChartMessage with non-standard keys
const chartData: ChartData = {
	chartType: "pie",
	data: [{category: "Civil", total: 1245}],
	config: {},
};
```

Correct:

```tsx
const chartData: ChartData = {
	chartType: "pie",
	data: [{name: "Civil", value: 1245}],
	config: {},
};
```

`ChartRenderer`'s pie branch hard-codes `dataKey="value"` and `nameKey="name"`.
When AI-generated chart payloads use other field names for pie data, the chart
renders with empty segments and no tooltip labels.

Source: `packages/components/src/chat/core-chart-renderer.tsx:148`

---

See also: `core-ui-charts/SKILL.md` — ChartRenderer and ChartContainer full reference
