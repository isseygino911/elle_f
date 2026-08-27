#!/usr/bin/env python3
"""Turn the manual Markdown into the structured data the /manual page renders.

Run: python3 docs/manual/build-content.py
Screenshots referenced here live in public/manual/screenshots/.

Output is a JS module of plain data — not HTML strings — so the page renders it
with real components and the app's own styling, and nothing is injected as raw
markup.
"""
import json
import os
import re

# Resolved from this file's own location so the script works from any cwd.
HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(os.path.dirname(HERE))
BASE = HERE
OUT = os.path.join(REPO, "src", "pages", "manual", "manualContent.js")

ROLES = [
    ("overview", "README.md", "Overview", "总览"),
    ("owner", "01-owner.md", "Studio Owner", "机构所有者"),
    ("teacher", "02-teacher.md", "Teacher", "教师"),
    ("manager", "03-manager.md", "Manager", "主管"),
    ("student", "04-student.md", "Student", "学生"),
]


def inline(t):
    """Inline markdown -> a small tagged-span list. No HTML strings."""
    parts, buf, i = [], "", 0

    def flush():
        nonlocal buf
        if buf:
            parts.append({"t": buf})
            buf = ""

    while i < len(t):
        # inline code
        m = re.match(r"`([^`]+)`", t[i:])
        if m:
            flush()
            parts.append({"t": m.group(1), "code": True})
            i += m.end()
            continue
        # bold
        m = re.match(r"\*\*([^*]+)\*\*", t[i:])
        if m:
            flush()
            parts.append({"t": m.group(1), "b": True})
            i += m.end()
            continue
        # italic
        m = re.match(r"(?<!\*)\*([^*\n]+)\*", t[i:])
        if m:
            flush()
            parts.append({"t": m.group(1), "i": True})
            i += m.end()
            continue
        # Link -> keep the label only; every manual is a tab on this one page,
        # so a cross-file link has nowhere to go. A label that is just the
        # filename ("01-owner.md") is meaningless to a reader here, so the
        # index table's links are dropped entirely rather than shown as text.
        m = re.match(r"\[([^\]]+)\]\(([^)]+)\)", t[i:])
        if m:
            flush()
            label = m.group(1)
            if not re.fullmatch(r"(?:\.\./)?(?:zh/)?[0-9A-Za-z._-]+\.md", label):
                parts.append({"t": label})
            i += m.end()
            continue
        buf += t[i]
        i += 1
    flush()
    # collapse to a bare string when there is no styling to carry
    if len(parts) == 1 and set(parts[0]) == {"t"}:
        return parts[0]["t"]
    return parts


def convert(md):
    """Markdown -> a list of block nodes."""
    md = re.sub(r"^> (中文版|English version).*$", "", md, flags=re.M)
    lines = md.split("\n")
    blocks, i = [], 0

    while i < len(lines):
        s = lines[i].strip()
        if not s:
            i += 1
            continue

        # image
        m = re.match(r"^!\[([^\]]*)\]\(([^)]+)\)\s*$", s)
        if m:
            blocks.append({
                "k": "img",
                "src": "/manual/screenshots/" + os.path.basename(m.group(2)),
                "cap": m.group(1),
            })
            i += 1
            continue

        if re.match(r"^-{3,}$", s):
            blocks.append({"k": "hr"})
            i += 1
            continue

        m = re.match(r"^(#{1,6})\s+(.*)$", s)
        if m:
            blocks.append({"k": "h", "lvl": len(m.group(1)), "c": inline(m.group(2))})
            i += 1
            continue

        # table
        if s.startswith("|") and i + 1 < len(lines) and re.match(r"^\|[\s:|-]+\|$", lines[i + 1].strip()):
            cells = lambda r: [c.strip() for c in r.strip().strip("|").split("|")]
            head = [inline(c) for c in cells(lines[i])]
            aligns = []
            for spec in cells(lines[i + 1]):
                aligns.append("center" if spec.startswith(":") and spec.endswith(":")
                              else "right" if spec.endswith(":") else "left")
            i += 2
            rows = []
            while i < len(lines) and lines[i].strip().startswith("|"):
                rows.append([inline(c) for c in cells(lines[i])])
                i += 1
            # A column whose every cell emptied out (the index table's
            # "My manual" links, which named files that are tabs here) would
            # otherwise render as a blank stripe.
            width = max([len(head)] + [len(r) for r in rows]) if rows else len(head)
            def blank(col):
                # Judged on the body only: the index table's dropped links left
                # a column of empty cells under a live "My manual" heading.
                return bool(rows) and all(col >= len(r) or not r[col] for r in rows)
            keep = [c for c in range(width) if not blank(c)]
            if len(keep) < width:
                head = [head[c] for c in keep if c < len(head)]
                rows = [[r[c] for c in keep if c < len(r)] for r in rows]
                aligns = [aligns[c] for c in keep if c < len(aligns)]
            blocks.append({"k": "table", "head": head, "rows": rows, "align": aligns})
            continue

        # blockquote
        if s.startswith(">"):
            buf = []
            while i < len(lines) and lines[i].strip().startswith(">"):
                buf.append(re.sub(r"^\s*>\s?", "", lines[i]))
                i += 1
            blocks.append({"k": "quote", "c": convert("\n".join(buf))})
            continue

        # ordered list
        if re.match(r"^\d+\.\s+", s):
            items = []
            while i < len(lines):
                m = re.match(r"^\d+\.\s+(.*)$", lines[i].strip())
                if not m:
                    if lines[i].startswith("   ") and lines[i].strip() and items:
                        items[-1] += " " + lines[i].strip()
                        i += 1
                        continue
                    break
                items.append(m.group(1))
                i += 1
            blocks.append({"k": "ol", "items": [inline(x) for x in items]})
            continue

        # unordered list
        if re.match(r"^[-*]\s+", s):
            items = []
            while i < len(lines):
                m = re.match(r"^[-*]\s+(.*)$", lines[i].strip())
                if not m:
                    if lines[i].startswith("  ") and lines[i].strip() and items:
                        items[-1] += " " + lines[i].strip()
                        i += 1
                        continue
                    break
                items.append(m.group(1))
                i += 1
            blocks.append({"k": "ul", "items": [inline(x) for x in items]})
            continue

        # paragraph
        buf = [s]
        i += 1
        while i < len(lines):
            nxt = lines[i].strip()
            if (not nxt or nxt.startswith(("#", ">", "|", "!"))
                    or re.match(r"^[-*]\s", nxt) or re.match(r"^\d+\.\s", nxt)
                    or re.match(r"^-{3,}$", nxt)):
                break
            buf.append(nxt)
            i += 1
        blocks.append({"k": "p", "c": inline(" ".join(buf))})

    return blocks


def main():
    data = {"en": {}, "zh": {}}
    labels = []
    for key, fname, en_label, zh_label in ROLES:
        labels.append({"key": key, "en": en_label, "zh": zh_label})
        for lang, folder in (("en", BASE), ("zh", os.path.join(BASE, "zh"))):
            md = open(os.path.join(folder, fname), encoding="utf-8").read()
            data[lang][key] = convert(md)

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    body = (
        "// GENERATED — do not edit by hand.\n"
        "// Source: docs/manual/*.md and docs/manual/zh/*.md\n"
        "// Rebuild: python3 docs/manual/build-content.py\n"
        "//\n"
        "// Block nodes, not HTML strings: ManualPage renders them with real\n"
        "// components, so nothing here is injected as markup.\n\n"
        "export const MANUAL_SECTIONS = " + json.dumps(labels, ensure_ascii=False, indent=2) + "\n\n"
        "export const MANUAL_CONTENT = " + json.dumps(data, ensure_ascii=False, indent=2) + "\n"
    )
    with open(OUT, "w", encoding="utf-8") as fh:
        fh.write(body)
    print(f"wrote {OUT} ({os.path.getsize(OUT) / 1024:.0f} KB)")
    for lang in ("en", "zh"):
        n = sum(len(v) for v in data[lang].values())
        print(f"  {lang}: {n} blocks across {len(data[lang])} sections")


if __name__ == "__main__":
    main()
