import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function minifyCss(css) {
  return css
    .replace(/\/\*[^*]*\*+(?:[^/*][^*]*\*+)*\//g, "")
    .replace(/\s+/g, " ")
    .replace(/\s*([{}:;,>~])\s*/g, "$1")
    .replace(/\(\s+/g, "(")
    .replace(/\s+\)/g, ")")
    .replace(/;}/g, "}")
    .trim();
}

function writeMinifiedCss() {
  const sourcePath = path.join(root, "styles.css");
  const targetPath = path.join(root, "styles.min.css");
  const source = fs.readFileSync(sourcePath, "utf8");
  fs.writeFileSync(targetPath, minifyCss(source), "utf8");

  const sourceBytes = fs.statSync(sourcePath).size;
  const targetBytes = fs.statSync(targetPath).size;
  console.log(`styles.css: ${sourceBytes} bytes`);
  console.log(`styles.min.css: ${targetBytes} bytes`);
}

writeMinifiedCss();
