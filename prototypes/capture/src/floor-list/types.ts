// Shared contract for the floor-list atoms (status-icon, status-badge, floor-progress-bar, floor-tabs)
// and the assembled FloorList / FloorPanel. Kept tiny and dependency-free so each atom can import it
// without pulling in the whole floor-panel module.

/** A floor's construction state — drives the status icon, badge, and timing copy. */
export type FloorStatus = "not-started" | "in-progress" | "complete";

/** The left-panel tabs (Figma "Capture Admin Redesign", node 1842:5601). */
export type FloorTab = "floors" | "schedule" | "lbs";
