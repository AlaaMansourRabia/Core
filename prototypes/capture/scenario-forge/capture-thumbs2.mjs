// Re-capture the screens whose nav failed / were mislabeled the first pass. Site + BOQ are already
// good. Uses text-based clicks (more robust than accessible-name regex for the icon+label tabs).
import {chromium} from "playwright";
import path from "path";

const OUT = path.resolve("prototypes/capture/scenario-forge/thumbs");
const BASE = "http://localhost:5180/";
const CLIP = {x: 226, y: 0, width: 1134, height: 820};

const browser = await chromium.launch({channel: "chrome", headless: false, args: ["--window-size=1380,900"]});
const page = await browser.newPage({viewport: {width: 1380, height: 860}});
const shot = async (name, ms = 3000) => {
	await page.waitForTimeout(ms);
	await page.screenshot({path: path.join(OUT, name + ".png"), clip: CLIP});
	console.log("saved", name);
};

await page.goto(BASE, {waitUntil: "domcontentloaded"});
await page.waitForTimeout(2000);

// PROGRESS DETAILS — plain tab
try { await page.getByText("Progress Details", {exact: true}).click({timeout: 5000}); } catch (e) { console.log("pd nav:", e.message); }
await shot("progress-details", 3500);

// EARNED VALUE — Progress work done dropdown → Earned Value (exact)
try {
	await page.getByText("Progress work done", {exact: true}).click({timeout: 5000});
	await page.getByRole("menuitem", {name: "Earned Value", exact: true}).click({timeout: 5000});
} catch (e) { console.log("ev nav:", e.message); }
await shot("earned-value", 2500);

// REPORTS — Reports dropdown → Milestone
try {
	await page.getByText("Reports", {exact: true}).click({timeout: 5000});
	await page.getByRole("menuitem", {name: "Milestone"}).click({timeout: 5000});
} catch (e) { console.log("rep nav:", e.message); }
await shot("reports", 2000);

// SETTINGS — gear icon button (aria-label)
try { await page.getByRole("button", {name: "Settings"}).click({timeout: 5000}); } catch (e) { console.log("set nav:", e.message); }
await shot("settings", 2000);

await browser.close();
console.log("done");
