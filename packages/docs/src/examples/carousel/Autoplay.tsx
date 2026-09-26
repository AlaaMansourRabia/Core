import {Card, CardContent} from "@corensystem/coren-ui/card";
/**
 * Carousel with autoplay functionality.
 */
import {Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious} from "@corensystem/coren-ui/carousel";
import Autoplay from "embla-carousel-autoplay";

export function AutoplayCarousel() {
	return (
		<Carousel
			plugins={[
				Autoplay({
					delay: 2000,
				}),
			]}
			className="wwc:w-full wwc:max-w-xs"
		>
			<CarouselContent>
				{Array.from({length: 5}).map((_, index) => (
					<CarouselItem key={index}>
						<div className="wwc:p-1">
							<Card>
								<CardContent className="wwc:flex wwc:aspect-square wwc:items-center wwc:justify-center wwc:p-6">
									<span className="wwc:text-4xl wwc:font-semibold">{index + 1}</span>
								</CardContent>
							</Card>
						</div>
					</CarouselItem>
				))}
			</CarouselContent>
			<CarouselPrevious />
			<CarouselNext />
		</Carousel>
	);
}
