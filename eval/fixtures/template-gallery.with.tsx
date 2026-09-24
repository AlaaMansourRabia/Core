import {Card, CardContent, CardTitle} from "@corensystem/coren-ui/card";
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger} from "@corensystem/coren-ui/dialog";
import {SearchFilterBar} from "@corensystem/coren-ui/search-filter-bar";

export function TemplateGallery({templates, onSearch}) {
	return (
		<Dialog>
			<DialogTrigger>New from template</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Choose a template</DialogTitle>
				</DialogHeader>
				<SearchFilterBar onChange={onSearch} />
				<div className="wwc:grid wwc:grid-cols-3 wwc:gap-4">
					{templates.map((t) => (
						<Card key={t.id}>
							<CardTitle>{t.name}</CardTitle>
							<CardContent>{t.summary}</CardContent>
						</Card>
					))}
				</div>
			</DialogContent>
		</Dialog>
	);
}
