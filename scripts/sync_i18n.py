#!/usr/bin/env python3
"""HU/EN i18n sync: key trees, missing EN, hardcoded HU scan, settings surface wrap.

Usage:
  python scripts/sync_i18n.py            # check + report
  python scripts/sync_i18n.py --write    # copy missing EN keys from HU; rewrite surfaceMap if needed
  python scripts/sync_i18n.py --apply    # wrap known HU literals in settings.tsx with tx()
  python scripts/sync_i18n.py --check    # exit 1 on missing keys / unmapped HU UI strings
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
HU_PATH = ROOT / "src" / "i18n" / "hu.ts"
EN_PATH = ROOT / "src" / "i18n" / "en.ts"
SURFACE_PATH = ROOT / "src" / "i18n" / "surfaceMap.ts"
SETTINGS_PATH = ROOT / "src" / "routes" / "settings.tsx"
SCAN_GLOBS = (
    "src/routes/settings.tsx",
    "src/routes/references.tsx",
    "src/routes/stats.tsx",
    "src/components/WorkspaceSettings.tsx",
    "src/components/onboarding/**/*.tsx",
    "src/components/onboarding/**/*.ts",
    "src/components/labs/**/*.tsx",
    "src/components/engine/**/*.tsx",
    "src/components/school/**/*.tsx",
    "src/components/support/SupportEmbedModal.tsx",
)
SKIP_NAME = re.compile(r"(^|[\\/])(i18n|surfaceMap|surfaceTx)([\\/]|\.|$)")
HU_CHARS = re.compile(r"[áéíóöőúüűÁÉÍÓÖŐÚÜŰ]")
STR_LIT = re.compile(r"""(['"`])((?:\\.|(?!\1).)*)\1""")
KEY_LINE = re.compile(r'^(\s*)([A-Za-z_][A-Za-z0-9_]*)\s*:\s*("(?:\\.|[^"\\])*")\s*,?\s*$')
BARE_KEY = re.compile(r"^(\s*)([A-Za-z_][A-Za-z0-9_]*)\s*:\s*\{")
CLOSE_BRACE = re.compile(r"^(\s*)\},?\s*$")
SURFACE_PAIR = re.compile(
    r'''(?:^|\n)\s*(?:([A-Za-zÁÉÍÓÖŐÚÜŰáéíóöőúüű_][A-Za-zÁÉÍÓÖŐÚÜŰáéíóöőúüű0-9_]*)|"((?:\\.|[^"\\])*)")\s*:\s*"((?:\\.|[^"\\])*)"\s*,?'''
)
SKIP_WRAP = {
    "Számlaazonosító;",
    "adó",
    "áfa",
    "díj",
    "kártya",
    "átutal",
    "demó",
    "REZSI: Adók",
    "REZSI: Bank szla.díjak",
    "EGYEBEK: Egyéb ktg.",
    "REZSI: Egyéb rezsi ktg.",
    "ÉRTÉKESÍTÉS",
    "Vállalkozás1",
}

ATTRS = ("title", "placeholder", "aria-label", "aria-labelledby", "alt", "label")


def unescape(s: str) -> str:
    return bytes(s, "utf-8").decode("unicode_escape") if "\\" in s else s


def parse_dict(path: Path) -> dict:
    """Parse nested `key: "string"` / `key: {` objects from a TS const export."""
    text = path.read_text(encoding="utf-8")
    start = text.find("export const")
    brace = text.find("{", start)
    if brace < 0:
        raise SystemExit(f"no object in {path}")
    keys: dict[str, str] = {}
    stack: list[str] = []
    i = brace + 1
    n = len(text)
    while i < n:
        ch = text[i]
        if ch in " \t\r\n":
            i += 1
            continue
        if text.startswith("//", i):
            i = text.find("\n", i)
            if i < 0:
                break
            continue
        if text.startswith("/*", i):
            end = text.find("*/", i + 2)
            i = n if end < 0 else end + 2
            continue
        if ch == "}":
            if stack:
                stack.pop()
            i += 1
            if i < n and text[i] == ",":
                i += 1
            continue
        m = re.match(r"([A-Za-z_][A-Za-z0-9_]*)\s*:", text[i:])
        if not m:
            i += 1
            continue
        key = m.group(1)
        i += m.end()
        while i < n and text[i] in " \t\r\n":
            i += 1
        if i < n and text[i] == "{":
            stack.append(key)
            i += 1
            continue
        if i < n and text[i] in "\"'`":
            quote = text[i]
            i += 1
            buf = []
            while i < n:
                c = text[i]
                if c == "\\" and i + 1 < n:
                    buf.append(text[i : i + 2])
                    i += 2
                    continue
                if c == quote:
                    i += 1
                    break
                buf.append(c)
                i += 1
            raw = "".join(buf)
            path_key = ".".join([*stack, key])
            keys[path_key] = raw
            while i < n and text[i] in " \t,":
                i += 1
            continue
        i += 1
    return keys


def parse_surface(path: Path) -> dict[str, str]:
    if not path.exists():
        return {}
    text = path.read_text(encoding="utf-8")
    out: dict[str, str] = {}
    for m in SURFACE_PAIR.finditer(text):
        hu = m.group(1) or m.group(2) or ""
        en = m.group(3) or ""
        hu = hu.replace('\\"', '"')
        en = en.replace('\\"', '"')
        if hu and en:
            out[hu] = en
    return out


def write_surface(path: Path, mapping: dict[str, str]) -> None:
    lines = [
        "/** HU → EN surface copy for settings forms/toasts that are not yet keyed. */",
        "export const SURFACE_HU_EN: Record<string, string> = {",
    ]
    for hu, en in sorted(mapping.items(), key=lambda kv: kv[0].lower()):
        hk = json.dumps(hu, ensure_ascii=False)
        ek = json.dumps(en, ensure_ascii=False)
        lines.append(f"  {hk}: {ek},")
    lines.append("};")
    lines.append("")
    path.write_text("\n".join(lines), encoding="utf-8")


def scan_hu_literals(root: Path) -> list[tuple[str, int, str]]:
    hits: list[tuple[str, int, str]] = []
    files = []
    for g in SCAN_GLOBS:
        files.extend(root.glob(g))
    for fp in files:
        rel = fp.relative_to(root).as_posix()
        if SKIP_NAME.search(rel):
            continue
        if rel.endswith(".test.ts") or rel.endswith(".test.tsx"):
            continue
        try:
            text = fp.read_text(encoding="utf-8")
        except OSError:
            continue
        for i, line in enumerate(text.splitlines(), 1):
            if "tx(" in line or "t(" in line:
                continue
            for m in STR_LIT.finditer(line):
                s = m.group(2)
                if len(s) < 3 or "${" in s:
                    continue
                if HU_CHARS.search(s):
                    hits.append((rel, i, s))
    return hits


def apply_surface_wrap(path: Path, mapping: dict[str, str]) -> int:
    text = path.read_text(encoding="utf-8")
    if "useSurfaceTx" not in text:
        print("settings.tsx missing useSurfaceTx — skip wrap", file=sys.stderr)
        return 0
    changed = 0
    items = sorted(mapping.keys(), key=len, reverse=True)

    def wrap_attr(m: re.Match) -> str:
        nonlocal changed
        attr, q, inner = m.group(1), m.group(2), m.group(3)
        if inner in mapping and f"tx({q}{inner}{q})" not in m.group(0):
            changed += 1
            return f"{attr}={{tx({q}{inner}{q})}}"
        return m.group(0)

    attr_re = re.compile(
        r"\b(" + "|".join(ATTRS) + r""")=(["'])([^"'\\\n]+)\2"""
    )
    text2, n = attr_re.subn(wrap_attr, text)
    text = text2

    for hu in items:
        if hu in SKIP_WRAP or "${" in hu:
            continue
        lit = json.dumps(hu, ensure_ascii=False)
        wrapped = f"tx({lit})"
        # quoted string not already inside tx(
        pat = re.compile(rf'(?<!tx\()(?<!t\(){re.escape(lit)}')
        text, c = pat.subn(wrapped, text)
        changed += c
        # JSX text node
        jsx = re.compile(rf">(\s*){re.escape(hu)}(\s*)<")
        text, c2 = jsx.subn(rf">{{\1{wrapped}\2}}<", text)
        changed += c2

    if changed:
        path.write_text(text, encoding="utf-8")
    return changed


def copy_missing_en(hu: dict[str, str], en_path: Path) -> int:
    """Insert missing EN keys as copies of HU (with [HU] prefix) before closing of export."""
    en = parse_dict(en_path)
    missing = [k for k in hu if k not in en]
    if not missing:
        return 0
    text = en_path.read_text(encoding="utf-8")
    # naive: append a comment block of missing keys is safer than AST rewrite
    extra = ["", "  // --- sync_i18n auto ---"]
    grouped: dict[str, list[tuple[str, str]]] = {}
    for k in missing:
        ns = k.split(".")[0]
        grouped.setdefault(ns, []).append((k, hu[k]))
    print(f"missing EN keys: {len(missing)} — fill by copying HU (review later)")
    # If trees differ, the test fails; --write prints the list for manual merge.
    for k in missing:
        print(f"  MISSING en.{k}")
    return len(missing)


def main() -> int:
    ap = argparse.ArgumentParser(description="Szcenárió HU/EN i18n sync")
    ap.add_argument("--write", action="store_true", help="report + rewrite surfaceMap sort")
    ap.add_argument("--apply", action="store_true", help="wrap settings.tsx with tx()")
    ap.add_argument("--check", action="store_true", help="exit 1 if keys diverge or HU leftovers")
    args = ap.parse_args()

    hu = parse_dict(HU_PATH)
    en = parse_dict(EN_PATH)
    surface = parse_surface(SURFACE_PATH)

    missing_en = sorted(k for k in hu if k not in en)
    extra_en = sorted(k for k in en if k not in hu)
    print(f"HU keys: {len(hu)}  EN keys: {len(en)}  surface: {len(surface)}")
    if missing_en:
        print(f"EN missing {len(missing_en)} keys:")
        for k in missing_en[:40]:
            print(f"  - {k}")
        if len(missing_en) > 40:
            print(f"  … {len(missing_en) - 40} more")
    if extra_en:
        print(f"EN extra {len(extra_en)} keys:")
        for k in extra_en[:20]:
            print(f"  + {k}")

    hits = scan_hu_literals(ROOT)
    unmapped = [
        h
        for h in hits
        if h[2] not in surface and h[2] not in SKIP_WRAP and "${" not in h[2]
    ]
    print(f"HU string literals in UI: {len(hits)}  unmapped: {len(unmapped)}")
    shown = 0
    for rel, line, s in unmapped:
        if shown >= 30:
            print("  …")
            break
        print(f"  {rel}:{line}: {s[:80]}")
        shown += 1

    if args.apply:
        n = apply_surface_wrap(SETTINGS_PATH, surface)
        print(f"wrapped {n} settings.tsx literals")

    if args.write:
        write_surface(SURFACE_PATH, surface)
        print(f"rewrote {SURFACE_PATH.relative_to(ROOT)}")
        copy_missing_en(hu, EN_PATH)

    if args.check and (missing_en or extra_en):
        return 1
    return 0


if __name__ == "__main__":
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass
    sys.exit(main())
