import {Baseline, PaintBucket, PencilLine} from "lucide-react";
import {useState} from "react";

import {CopyButton} from "@/components/ui/copy-button";
import {Toolbar, ToolbarButton, ToolbarSeparator} from "@/components/ui/toolbar";
import {ToolbarColorPicker} from "@/components/ui/toolbar-color-picker";

export function ToolbarColorPickerPage() {
	const [fill, setFill] = useState("#2563EB");
	const [outline, setOutline] = useState("#7C3AED");
	const [textColor, setTextColor] = useState("#111827");
	const [swatchOnly, setSwatchOnly] = useState("#00B050");
	const [fillSwatch, setFillSwatch] = useState("#FFC000");
	const [compactColor, setCompactColor] = useState("#FF0000");

	return (
		<div className="wwc:space-y-8">
			<div>
				<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
					<h1 className="wwc:text-3xl wwc:font-bold">Toolbar Color Picker</h1>
					<CopyButton
						value="Toolbar Color Picker"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:mt-2 wwc:max-w-2xl wwc:text-muted-foreground">
					A PowerPoint-style color control for a toolbar: a button previewing the current color that opens a popover of
					swatch groups, a <strong>No fill</strong> option, a Recent row (filled as you pick custom colors), and an OS
					color picker via <strong>More colors…</strong>. Empty string (<code className="wwc:text-xs">""</code>) is the
					"no fill" value.
				</p>
			</div>

			{/* In a toolbar */}
			<section className="wwc:space-y-3 wwc:rounded-lg wwc:border wwc:p-6">
				<div>
					<h2 className="wwc:font-semibold">On a toolbar</h2>
					<p className="wwc:text-sm wwc:text-muted-foreground">
						Pass an <code className="wwc:text-xs">icon</code> to show the color as a bar beneath it (default{" "}
						<code className="wwc:text-xs">preview="bar"</code>), or{" "}
						<code className="wwc:text-xs">preview="swatch"</code> for an icon + a swatch square to its right. Omit{" "}
						<code className="wwc:text-xs">icon</code> for a plain swatch.
					</p>
				</div>
				<Toolbar>
					<ToolbarButton icon label="Bold" className="wwc:font-semibold">
						B
					</ToolbarButton>
					<ToolbarSeparator />
					<ToolbarColorPicker
						label="Text color"
						icon={<Baseline className="wwc:h-4 wwc:w-4" />}
						value={textColor}
						onValueChange={setTextColor}
					/>
					<ToolbarColorPicker
						label="Fill color"
						icon={<PaintBucket className="wwc:h-4 wwc:w-4" />}
						value={fill}
						onValueChange={setFill}
					/>
					<ToolbarColorPicker
						label="Shape outline"
						icon={<PencilLine className="wwc:h-4 wwc:w-4" />}
						noColorLabel="No outline"
						value={outline}
						onValueChange={setOutline}
					/>
					<ToolbarSeparator />
					<ToolbarColorPicker
						label="Fill color (swatch preview)"
						icon={<PaintBucket className="wwc:h-4 wwc:w-4" />}
						preview="swatch"
						value={fillSwatch}
						onValueChange={setFillSwatch}
					/>
				</Toolbar>
				<p className="wwc:font-mono wwc:text-xs wwc:text-muted-foreground">
					text: {textColor || '"" (no fill)'} · fill: {fill || '"" (no fill)'} · outline: {outline || '"" (no line)'}
				</p>
			</section>

			{/* Plain swatch trigger */}
			<section className="wwc:space-y-3 wwc:rounded-lg wwc:border wwc:p-6">
				<div>
					<h2 className="wwc:font-semibold">Swatch trigger (no icon)</h2>
					<p className="wwc:text-sm wwc:text-muted-foreground">
						Without <code className="wwc:text-xs">icon</code>, the trigger shows the current color as a swatch. Click{" "}
						<strong>More colors…</strong> to open the OS picker; picked colors land in the Recent row.
					</p>
				</div>
				<Toolbar>
					<ToolbarColorPicker label="Color" value={swatchOnly} onValueChange={setSwatchOnly} align="start" />
				</Toolbar>
				<p className="wwc:font-mono wwc:text-xs wwc:text-muted-foreground">selected: {swatchOnly || '"" (no fill)'}</p>
			</section>

			{/* Compact */}
			<section className="wwc:space-y-3 wwc:rounded-lg wwc:border wwc:p-6">
				<div>
					<h2 className="wwc:font-semibold">Compact (swatches only)</h2>
					<p className="wwc:text-sm wwc:text-muted-foreground">
						<code className="wwc:text-xs">compact</code> drops all labels and text — the popover is just the swatch
						grid. No-fill is the first swatch (white with the red line) and the color-wheel swatch opens the OS picker.
					</p>
				</div>
				<Toolbar>
					<ToolbarColorPicker label="Color" compact value={compactColor} onValueChange={setCompactColor} />
				</Toolbar>
				<p className="wwc:font-mono wwc:text-xs wwc:text-muted-foreground">
					selected: {compactColor || '"" (no fill)'}
				</p>
			</section>
		</div>
	);
}
