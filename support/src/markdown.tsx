import type { ReactNode } from "react";

function stripFrontmatter(src: string) {
  if (!src.startsWith("---")) return src;
  const end = src.indexOf("\n---", 3);
  if (end < 0) return src;
  return src.slice(end + 4).replace(/^\s+/, "");
}

function inline(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const tok = m[0];
    if (tok.startsWith("**")) {
      out.push(<strong key={`b${i++}`}>{tok.slice(2, -2)}</strong>);
    } else if (tok.startsWith("`")) {
      out.push(<code key={`c${i++}`}>{tok.slice(1, -1)}</code>);
    } else {
      const label = tok.slice(1, tok.indexOf("]"));
      const href = tok.slice(tok.indexOf("(") + 1, -1);
      out.push(
        <a key={`a${i++}`} href={href}>
          {label}
        </a>,
      );
    }
    last = m.index + tok.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

function isTableRow(line: string) {
  return line.trim().startsWith("|") && line.trim().endsWith("|");
}

function isSepRow(line: string) {
  return /^\|?(\s*:?-{3,}:?\s*\|)+\s*:?-{3,}:?\s*\|?$/.test(line.trim());
}

function cells(line: string) {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((c) => c.trim());
}

export function Markdown({ source }: { source: string }) {
  const lines = stripFrontmatter(source).replace(/\r\n/g, "\n").split("\n");
  const nodes: ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i += 1;
      continue;
    }

    if (line.startsWith("# ")) {
      nodes.push(<h1 key={key++}>{inline(line.slice(2))}</h1>);
      i += 1;
      continue;
    }
    if (line.startsWith("## ")) {
      nodes.push(<h2 key={key++}>{inline(line.slice(3))}</h2>);
      i += 1;
      continue;
    }
    if (line.startsWith("### ")) {
      nodes.push(<h3 key={key++}>{inline(line.slice(4))}</h3>);
      i += 1;
      continue;
    }

    if (line.startsWith("> ")) {
      const buf: string[] = [];
      while (i < lines.length && lines[i].startsWith("> ")) {
        buf.push(lines[i].replace(/^>\s?/, ""));
        i += 1;
      }
      nodes.push(
        <blockquote key={key++} className="tip">
          {buf.map((b, idx) => (
            <p key={idx}>{inline(b)}</p>
          ))}
        </blockquote>,
      );
      continue;
    }

    if (/^\d+\.\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s/, ""));
        i += 1;
      }
      nodes.push(
        <ol key={key++}>
          {items.map((t, idx) => (
            <li key={idx}>{inline(t)}</li>
          ))}
        </ol>,
      );
      continue;
    }

    if (line.startsWith("- ")) {
      const items: string[] = [];
      while (i < lines.length && lines[i].startsWith("- ")) {
        items.push(lines[i].slice(2));
        i += 1;
      }
      nodes.push(
        <ul key={key++}>
          {items.map((t, idx) => (
            <li key={idx}>{inline(t)}</li>
          ))}
        </ul>,
      );
      continue;
    }

    if (isTableRow(line) && i + 1 < lines.length && isSepRow(lines[i + 1])) {
      const head = cells(line);
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && isTableRow(lines[i]) && !isSepRow(lines[i])) {
        rows.push(cells(lines[i]));
        i += 1;
      }
      nodes.push(
        <div key={key++} className="table-wrap">
          <table>
            <thead>
              <tr>
                {head.map((c, idx) => (
                  <th key={idx}>{inline(c)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, ri) => (
                <tr key={ri}>
                  {r.map((c, ci) => (
                    <td key={ci}>{inline(c)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      continue;
    }

    nodes.push(<p key={key++}>{inline(line)}</p>);
    i += 1;
  }

  return <article className="article">{nodes}</article>;
}
