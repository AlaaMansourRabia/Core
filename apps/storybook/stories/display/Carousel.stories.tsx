import type {Meta, StoryObj} from "storybook/internal/types";

import {Card, CardContent} from "@core/core-ui/card";
import {Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious} from "@core/core-ui/carousel";
import {expect, userEvent, waitFor, within} from "storybook/test";

const meta = {
	title: "Components/Data Display/Carousel",
	component: Carousel,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component:
					"Carousel built on Embla with swipe support, keyboard navigation, and configurable orientation. Compound component with CarouselContent, CarouselItem, and navigation buttons.",
			},
		},
	},
} satisfies Meta<typeof Carousel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => (
		<div className="wwc:mx-auto wwc:max-w-xs">
			<Carousel>
				<CarouselContent>
					{Array.from({length: 5}).map((_, index) => (
						<CarouselItem key={index}>
							<div className="wwc:p-1">
								<div className="wwc:flex wwc:aspect-square wwc:items-center wwc:justify-center wwc:rounded-md wwc:border wwc:bg-muted wwc:p-6">
									<span className="wwc:text-4xl wwc:font-semibold">{index + 1}</span>
								</div>
							</div>
						</CarouselItem>
					))}
				</CarouselContent>
				<CarouselPrevious />
				<CarouselNext />
			</Carousel>
		</div>
	),
};

export const MultipleItems: Story = {
	render: () => (
		<div className="wwc:mx-auto wwc:max-w-sm">
			<Carousel opts={{align: "start"}}>
				<CarouselContent className="wwc:-ml-2">
					{Array.from({length: 8}).map((_, index) => (
						<CarouselItem key={index} className="wwc:basis-1/3 wwc:pl-2">
							<div className="wwc:p-1">
								<div className="wwc:flex wwc:aspect-square wwc:items-center wwc:justify-center wwc:rounded-md wwc:border wwc:bg-muted">
									<span className="wwc:text-2xl wwc:font-semibold">{index + 1}</span>
								</div>
							</div>
						</CarouselItem>
					))}
				</CarouselContent>
				<CarouselPrevious />
				<CarouselNext />
			</Carousel>
		</div>
	),
};

export const WithCards: Story = {
	render: () => (
		<div className="wwc:mx-auto wwc:max-w-sm">
			<Carousel>
				<CarouselContent>
					{["Safety Score", "Workers Active", "Zones Monitored", "Alerts Today", "Uptime"].map((title, index) => (
						<CarouselItem key={title}>
							<div className="wwc:p-1">
								<Card>
									<CardContent className="wwc:flex wwc:flex-col wwc:items-center wwc:justify-center wwc:p-6">
										<span className="wwc:text-3xl wwc:font-bold">{(index + 1) * 23}</span>
										<span className="wwc:mt-1 wwc:text-sm wwc:text-muted-foreground">{title}</span>
									</CardContent>
								</Card>
							</div>
						</CarouselItem>
					))}
				</CarouselContent>
				<CarouselPrevious />
				<CarouselNext />
			</Carousel>
		</div>
	),
};

export const Vertical: Story = {
	render: () => (
		<div className="wwc:mx-auto wwc:max-w-xs">
			<Carousel orientation="vertical" className="wwc:max-h-[300px]">
				<CarouselContent className="wwc:-mt-2 wwc:h-[250px]">
					{Array.from({length: 5}).map((_, index) => (
						<CarouselItem key={index} className="wwc:pt-2 wwc:basis-1/2">
							<div className="wwc:p-1">
								<div className="wwc:flex wwc:items-center wwc:justify-center wwc:rounded-md wwc:border wwc:bg-muted wwc:p-6">
									<span className="wwc:text-2xl wwc:font-semibold">{index + 1}</span>
								</div>
							</div>
						</CarouselItem>
					))}
				</CarouselContent>
				<CarouselPrevious />
				<CarouselNext />
			</Carousel>
		</div>
	),
};

export const Loop: Story = {
	render: () => (
		<div className="wwc:mx-auto wwc:max-w-xs">
			<Carousel opts={{loop: true}}>
				<CarouselContent>
					{Array.from({length: 5}).map((_, index) => (
						<CarouselItem key={index}>
							<div className="wwc:p-1">
								<div className="wwc:flex wwc:aspect-square wwc:items-center wwc:justify-center wwc:rounded-md wwc:border wwc:bg-muted wwc:p-6">
									<span className="wwc:text-4xl wwc:font-semibold">{index + 1}</span>
								</div>
							</div>
						</CarouselItem>
					))}
				</CarouselContent>
				<CarouselPrevious />
				<CarouselNext />
			</Carousel>
		</div>
	),
};

export const NavigationInteraction: Story = {
	render: () => (
		<div className="wwc:mx-auto wwc:max-w-xs wwc:px-16">
			<Carousel>
				<CarouselContent>
					{Array.from({length: 3}).map((_, index) => (
						<CarouselItem key={index}>
							<div className="wwc:p-1">
								<div className="wwc:flex wwc:aspect-square wwc:items-center wwc:justify-center wwc:rounded-md wwc:border wwc:bg-muted wwc:p-6">
									<span className="wwc:text-4xl wwc:font-semibold">{index + 1}</span>
								</div>
							</div>
						</CarouselItem>
					))}
				</CarouselContent>
				<CarouselPrevious />
				<CarouselNext />
			</Carousel>
		</div>
	),
	play: async ({canvasElement}) => {
		const canvas = within(canvasElement);
		const nextButton = canvas.getByRole("button", {name: /next slide/i});
		const prevButton = canvas.getByRole("button", {name: /previous slide/i});

		await expect(nextButton).toBeVisible();
		await expect(prevButton).toBeVisible();

		// Navigate forward and back
		await userEvent.click(nextButton, {pointerEventsCheck: 0});
		await userEvent.click(prevButton, {pointerEventsCheck: 0});
	},
};
