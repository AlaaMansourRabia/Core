import {Card, CardContent, CardTitle, Dialog, DialogContent} from "@corensystem/coren-ui";

export function TemplateGallery({templates, open}) {
	return (
		<Dialog open={open}>
			<DialogContent>
				<input placeholder="Search" className="border p-2" />
				<div className="grid grid-cols-3 gap-4">
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
