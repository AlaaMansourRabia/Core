/**
 * The shadow for surfaces that float over content — map panels, legends, the timeline, floating
 * cards. Deliberately shallow: a floating panel should read as lifted a millimetre off the map, not
 * as a modal hovering above it. Kept in one place so every floating surface agrees.
 */
const FLOAT_SHADOW = "wwc:shadow-[0_4px_12px_rgba(0,0,0,0.06)]";

export {FLOAT_SHADOW};
