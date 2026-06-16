import fs from "node:fs";

const html = fs.readFileSync("index.html", "utf8");
const css = fs.readFileSync("styles.css", "utf8");
const minCss = fs.readFileSync("styles.min.css", "utf8");
const icons = fs.readFileSync("assets/icons.svg", "utf8");

const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
const anchors = [...html.matchAll(/href="#([^"]+)"/g)].map((match) => match[1]);
const missingAnchors = anchors.filter((anchor) => !ids.includes(anchor));
const iconUses = [...html.matchAll(/href="assets\/icons\.svg#(icon-[^"]+)"/g)].map((match) => match[1]);
const missingIcons = iconUses.filter((icon) => !icons.includes(`id="${icon}"`));
const pngReference = /dogui-hero\.png/.test(html);

const failures = [
  duplicateIds.length && `duplicate ids: ${[...new Set(duplicateIds)].join(", ")}`,
  missingAnchors.length && `missing anchors: ${[...new Set(missingAnchors)].join(", ")}`,
  missingIcons.length && `missing icons: ${[...new Set(missingIcons)].join(", ")}`,
  pngReference && "index.html still references dogui-hero.png",
  !html.includes("styles.min.css") && "index.html must use styles.min.css",
  !css.includes("content-visibility") && "styles.css should keep content-visibility optimization",
  minCss.length >= css.length && "styles.min.css is not smaller than styles.css",
].filter(Boolean);

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("project checks passed");
