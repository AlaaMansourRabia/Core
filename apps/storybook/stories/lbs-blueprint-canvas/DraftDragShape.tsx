import {Line, Rect} from "react-konva";

import {BLUEPRINT_CANVAS_DEFAULT_STYLE, BLUEPRINT_DRAFT_SHAPE_DASH, BLUEPRINT_SHAPE_STROKE_WIDTH} from "./constants";
import type {DraftStyle, DragDraft, ImageLayout} from "./types";
import {imagePointToStagePoint} from "./utils";

type DraftDragShapeProps = {
	draft: DragDraft;
	layout: ImageLayout;
	style: DraftStyle;
};

export function DraftDragShape({draft, layout, style}: DraftDragShapeProps) {
	const start = imagePointToStagePoint(draft.start, layout);
	const current = imagePointToStagePoint(draft.current, layout);

	if (draft.type === "Line") {
		return (
			<Line
				points={[start.x, start.y, current.x, current.y]}
				stroke={style.strokeEnabled ? style.strokeColor : BLUEPRINT_CANVAS_DEFAULT_STYLE.strokeColor}
				strokeWidth={BLUEPRINT_SHAPE_STROKE_WIDTH}
				dash={[...BLUEPRINT_DRAFT_SHAPE_DASH]}
				lineCap="round"
				listening={false}
			/>
		);
	}

	return (
		<Rect
			x={Math.min(start.x, current.x)}
			y={Math.min(start.y, current.y)}
			width={Math.abs(current.x - start.x)}
			height={Math.abs(current.y - start.y)}
			fill={style.fillEnabled ? style.fillColor : undefined}
			stroke={style.strokeEnabled ? style.strokeColor : BLUEPRINT_CANVAS_DEFAULT_STYLE.strokeColor}
			strokeWidth={BLUEPRINT_SHAPE_STROKE_WIDTH}
			opacity={style.opacity}
			dash={[...BLUEPRINT_DRAFT_SHAPE_DASH]}
			listening={false}
		/>
	);
}
