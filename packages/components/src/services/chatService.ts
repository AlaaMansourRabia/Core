import type {ChartData} from "../types/chat";

export function generateId(): string {
	return Math.random().toString(36).substring(2, 15);
}

export interface ChatResponse {
	message: string;
	chart?: ChartData;
	targetTab?: string;
}

export async function sendChatMessage(_content: string, _apiEndpoint?: string): Promise<ChatResponse> {
	// Simulate API delay
	await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1000));

	// Mock response - in production this would call an actual API
	const responses: ChatResponse[] = [
		{
			message:
				"I've analyzed the data you requested. The project performance metrics show positive trends across most KPIs.",
		},
		{
			message: "Here's a visualization of the workforce distribution:",
			chart: {
				chartType: "bar",
				data: [
					{name: "Week 1", workers: 120},
					{name: "Week 2", workers: 145},
					{name: "Week 3", workers: 132},
					{name: "Week 4", workers: 168},
				],
				config: {
					workers: {label: "Workers", color: "#d99447"},
				},
				xAxisKey: "name",
				dataKeys: ["workers"],
				title: "Weekly Workforce Distribution",
			},
			targetTab: "performance",
		},
	];

	// Return a random response for demo purposes
	return responses[Math.floor(Math.random() * responses.length)];
}
