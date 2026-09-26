import {Card, CardContent} from "@corensystem/coren-ui/card";
/**
 * Carousel with different item sizes.
 */
import {Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious} from "@corensystem/coren-ui/carousel";

export function Sizes() {
	return (
		<Carousel
			opts={{
				align: "start",
			}}
			className="wwc:w-full wwc:max-w-sm"
		>
			<CarouselContent>
				{Array.from({length: 5}).map((_, index) => (
					<CarouselItem key={index} className="wwc:basis-1/3">
						<div className="wwc:p-1">
							<Card>
								<CardContent className="wwc:flex wwc:aspect-square wwc:items-center wwc:justify-center wwc:p-6">
									<span className="wwc:text-2xl wwc:font-semibold">{index + 1}</span>
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
