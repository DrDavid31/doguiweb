import re
from pathlib import Path


ROOT = Path(__file__).resolve().parent


def minify_css(css: str) -> str:
    css = re.sub(r"/\*[^*]*\*+(?:[^/*][^*]*\*+)*/", "", css)
    css = re.sub(r"\s+", " ", css)
    css = re.sub(r"\s*([{}:;,>~])\s*", r"\1", css)
    css = re.sub(r"\(\s+", "(", css)
    css = re.sub(r"\s+\)", ")", css)
    css = re.sub(r";}", "}", css)
    return css.strip()


def main() -> int:
    source = ROOT / "styles.css"
    target = ROOT / "styles.min.css"
    target.write_text(minify_css(source.read_text(encoding="utf-8")), encoding="utf-8")
    print(f"{source.name}: {source.stat().st_size} bytes")
    print(f"{target.name}: {target.stat().st_size} bytes")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
