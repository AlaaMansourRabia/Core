import {writeFileSync, mkdirSync} from "node:fs";
import {dirname, join} from "node:path";
import {fileURLToPath} from "node:url";
// Generates a proper login-hero placeholder PNG for Studio (the repo ships only a 16x16 stub, which
// looks broken stretched across the login page's image section). Pure Node, no deps: a diagonal
// brand gradient with a soft light so the CoreLoginPage demo reads as a real product screen.
import {deflateSync} from "node:zlib";

const HERE = dirname(fileURLToPath(import.meta.url));
const W = 1600;
const H = 2000;

const CRC = (() => {
	const t = new Uint32Array(256);
	for (let n = 0; n < 256; n++) {
		let c = n;
		for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
		t[n] = c >>> 0;
	}
	return (buf) => {
		let c = 0xffffffff;
		for (let i = 0; i < buf.length; i++) c = t[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
		return (c ^ 0xffffffff) >>> 0;
	};
})();

function chunk(type, data) {
	const len = Buffer.alloc(4);
	len.writeUInt32BE(data.length, 0);
	const typeBuf = Buffer.from(type, "ascii");
	const crc = Buffer.alloc(4);
	crc.writeUInt32BE(CRC(Buffer.concat([typeBuf, data])), 0);
	return Buffer.concat([len, typeBuf, data, crc]);
}

const lerp = (a, b, t) => Math.round(a + (b - a) * t);
// deep slate -> brand sky, with a soft top-left light
const c1 = [15, 23, 42]; // #0f172a
const c2 = [2, 132, 199]; // #0284c7

const raw = Buffer.alloc(H * (1 + W * 3));
for (let y = 0; y < H; y++) {
	const rowStart = y * (1 + W * 3);
	raw[rowStart] = 0; // filter: none
	for (let x = 0; x < W; x++) {
		const t = (x / W + y / H) / 2;
		// radial light near top-left
		const dx = x / W - 0.28;
		const dy = y / H - 0.22;
		const light = Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy) * 1.6) * 0.25;
		const o = rowStart + 1 + x * 3;
		raw[o] = Math.min(255, lerp(c1[0], c2[0], t) + light * 255);
		raw[o + 1] = Math.min(255, lerp(c1[1], c2[1], t) + light * 255);
		raw[o + 2] = Math.min(255, lerp(c1[2], c2[2], t) + light * 255);
	}
}

const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(W, 0);
ihdr.writeUInt32BE(H, 4);
ihdr[8] = 8; // bit depth
ihdr[9] = 2; // color type: RGB
const png = Buffer.concat([
	Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
	chunk("IHDR", ihdr),
	chunk("IDAT", deflateSync(raw, {level: 9})),
	chunk("IEND", Buffer.alloc(0)),
]);

const out = join(HERE, "..", "public", "images", "controlroom.png");
mkdirSync(dirname(out), {recursive: true});
writeFileSync(out, png);
console.log(`wrote ${out} — ${(png.length / 1024).toFixed(0)}KB, ${W}x${H}`);
