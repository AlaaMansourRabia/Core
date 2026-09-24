/**
 * Provide clear navigation controls.
 */
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "@corensystem/coren-ui/carousel";
import {Card, CardContent} from "@corensystem/coren-ui/card";

export function NavigationDo() {
	return (
		<div className="wwc:space-y-4">
			<Carousel className="wwc:w-full wwc:max-w-xs">
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
			<p className="wwc:text-xs wwc:text-center wwc:text-muted-foreground">
				Use arrows or swipe to navigate
			</p>
		</div>
	);
}
