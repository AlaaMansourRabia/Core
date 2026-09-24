/**
 * Use carousels for related, browsable content.
 */
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "@corensystem/coren-ui/carousel";
import {Card, CardContent, CardFooter, CardHeader, CardTitle} from "@corensystem/coren-ui/card";
import {Badge} from "@corensystem/coren-ui/badge";

const products = [
	{name: "Wireless Headphones", price: "$99", tag: "Popular"},
	{name: "Smart Watch", price: "$199", tag: "New"},
	{name: "Portable Speaker", price: "$79", tag: "Sale"},
	{name: "Fitness Tracker", price: "$49", tag: "Best Value"},
];

export function ContentDo() {
	return (
		<Carousel className="wwc:w-full wwc:max-w-sm">
			<CarouselContent>
				{products.map((product, index) => (
					<CarouselItem key={index} className="wwc:basis-3/4">
						<Card>
							<CardHeader>
								<Badge className="wwc:w-fit">{product.tag}</Badge>
								<CardTitle className="wwc:text-lg">{product.name}</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="wwc:aspect-square wwc:rounded-md wwc:bg-muted wwc:flex wwc:items-center wwc:justify-center">
									<span className="wwc:text-muted-foreground">Image</span>
								</div>
							</CardContent>
							<CardFooter>
								<span className="wwc:font-semibold">{product.price}</span>
							</CardFooter>
						</Card>
					</CarouselItem>
				))}
			</CarouselContent>
			<CarouselPrevious />
			<CarouselNext />
		</Carousel>
	);
}
