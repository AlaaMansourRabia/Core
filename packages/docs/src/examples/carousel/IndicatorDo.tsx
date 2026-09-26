import {Card, CardContent} from "@corensystem/coren-ui/card";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
	type CarouselApi,
} from "@corensystem/coren-ui/carousel";
/**
 * Show position indicators for context.
 */
import * as React from "react";

export function IndicatorDo() {
	const [api, setApi] = React.useState<CarouselApi>();
	const [current, setCurrent] = React.useState(0);
	const [count, setCount] = React.useState(0);

	React.useEffect(() => {
		if (!api) return;
		setCount(api.scrollSnapList().length);
		setCurrent(api.selectedScrollSnap() + 1);
		api.on("select", () => {
			setCurrent(api.selectedScrollSnap() + 1);
		});
	}, [api]);

	return (
		<div className="wwc:space-y-2">
			<Carousel setApi={setApi} className="wwc:w-full wwc:max-w-xs">
				<CarouselContent>
					{Array.from({length: 5}).map((_, index) => (
						<CarouselItem key={index}>
							<Card>
								<CardContent className="wwc:flex wwc:aspect-video wwc:items-center wwc:justify-center wwc:p-6">
									<span className="wwc:text-2xl wwc:font-semibold">Slide {index + 1}</span>
								</CardContent>
							</Card>
						</CarouselItem>
					))}
				</CarouselContent>
				<CarouselPrevious />
				<CarouselNext />
			</Carousel>
			<div className="wwc:text-center wwc:text-sm wwc:text-muted-foreground">
				{current} of {count}
			</div>
		</div>
	);
}
