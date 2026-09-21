// Capture real screenshots of the running Capture prototype (:5180) for each screen that backs an
// "existing" scenario, and save them as thumbs/{screen}.png for the dashboard.
// Run from the malabo repo root:  node prototypes/capture/scenario-forge/capture-thumbs.mjs
import {chromium} from "playwright";
import fs from "fs";
import path from "path";

const OUT = path.resolve("prototypes/capture/scenario-forge/thumbs");
fs.mkdirSync(OUT, {recursive: true});
const BASE = "http://localhost:5180/";
const CLIP = {x: 226, y: 0, width: 1134, height: 820}; // content area, minus the app sidebar

const browser = await chromium.launch({channel: "chrome", headless: false, args: ["--window-size=1380,900"]});
const page = await browser.newPage({viewport: {width: 1380, height: 860}, deviceScaleFactor: 1});
const shot = async (name, ms = 1200) => {
	await page.waitForTimeout(ms);
	await page.screenshot({path: path.join(OUT, name + ".png"), clip: CLIP});
	console.log("saved", name);
};
const clickBtn = async (re, ms = 4000) => page.getByRole("button", {name: re}).first().click({timeout: ms});
const clickItem = async (opts) => page.getByRole("menuitem", opts).click({timeout: 4000});

await page.goto(BASE, {waitUntil: "domcontentloaded"});
await page.waitForTimeout(1500);

// SITE — default tab; give Cesium time to render the model.
try { await clickBtn(/^Site$/, 3000); } catch {}
await shot("site", 8000);

// PROGRESS DETAILS
try { await clickBtn(/^Progress Details$/); } catch (e) { console.log("pd", e.message); }
await shot("progress-details", 2500);

// BOQ — via the "Progress work done" dropdown
try { await clickBtn(/Progress work done/); await clickItem({name: /BOQ Viewer/}); } catch (e) { console.log("boq", e.message); }
await shot("boq", 1500);

// EARNED VALUE — same dropdown (exact, so it doesn't match "…by Division")
try { await clickBtn(/Progress work done/); await clickItem({name: "Earned Value", exact: true}); } catch (e) { console.log("ev", e.message); }
await shot("earned-value", 1500);

// REPORTS — dropdown → Milestone
try { await clickBtn(/^Reports/); await clickItem({name: /Milestone/}); } catch (e) { console.log("rep", e.message); }
await shot("reports", 1200);

// SETTINGS — gear button (aria-label "Settings")
try { await clickBtn(/^Settings$/); } catch (e) { console.log("set", e.message); }
await shot("settings", 1200);

await browser.close();
console.log("done");
