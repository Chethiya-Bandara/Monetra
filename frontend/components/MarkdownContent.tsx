import type { ReactNode } from "react";

type MarkdownContentProps = {
  content: string;
  className?: string;
};

const safeHref = (href: string) => {
  try {
    const url = new URL(href);
    return url.protocol === "https:" || url.protocol === "http:" ? href : undefined;
  } catch {
    return undefined;
  }
};

function inlineMarkdown(text: string): ReactNode[] {
  const tokens = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\)|\*[^*]+\*|_[^_]+_)/g);

  return tokens.filter(Boolean).map((token, index) => {
    if (token.startsWith("**") && token.endsWith("**")) return <strong key={index} className="font-semibold">{token.slice(2, -2)}</strong>;
    if (token.startsWith("`") && token.endsWith("`")) return <code key={index} className="rounded bg-slate-200/80 px-1 py-0.5 font-mono text-[0.85em] dark:bg-slate-700/80">{token.slice(1, -1)}</code>;
    if (token.startsWith("[") && token.includes("](")) {
      const match = token.match(/^\[([^\]]+)\]\(([^\s)]+)\)$/);
      const href = match && safeHref(match[2]);
      return href ? <a key={index} href={href} target="_blank" rel="noreferrer" className="font-medium text-emerald-700 underline underline-offset-2 hover:text-emerald-600 dark:text-emerald-400">{match[1]}</a> : token;
    }
    if ((token.startsWith("*") && token.endsWith("*")) || (token.startsWith("_") && token.endsWith("_"))) return <em key={index}>{token.slice(1, -1)}</em>;
    return token;
  });
}

export default function MarkdownContent({ content, className = "" }: MarkdownContentProps) {
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    if (!line.trim()) { index += 1; continue; }

    if (line.startsWith("```")) {
      const code: string[] = [];
      index += 1;
      while (index < lines.length && !lines[index].startsWith("```")) code.push(lines[index++]);
      index += 1;
      blocks.push(<pre key={blocks.length} className="overflow-x-auto rounded-lg bg-slate-900 p-3 text-xs leading-5 text-slate-100"><code>{code.join("\n")}</code></pre>);
      continue;
    }

    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      const Heading = heading[1].length === 1 ? "h3" : heading[1].length === 2 ? "h4" : "h5";
      blocks.push(<Heading key={blocks.length} className="mt-3 font-semibold first:mt-0">{inlineMarkdown(heading[2])}</Heading>);
      index += 1;
      continue;
    }

    const listMatch = line.match(/^\s*([-*+] |\d+\. )(.+)$/);
    if (listMatch) {
      const ordered = /^\d+\. /.test(listMatch[1]);
      const items: ReactNode[] = [];
      while (index < lines.length) {
        const item = lines[index].match(/^\s*([-*+] |\d+\. )(.+)$/);
        if (!item || /^\d+\. /.test(item[1]) !== ordered) break;
        items.push(<li key={items.length}>{inlineMarkdown(item[2])}</li>);
        index += 1;
      }
      const List = ordered ? "ol" : "ul";
      blocks.push(<List key={blocks.length} className={`my-2 space-y-1 pl-5 ${ordered ? "list-decimal" : "list-disc"}`}>{items}</List>);
      continue;
    }

    if (line.startsWith("> ")) {
      blocks.push(<blockquote key={blocks.length} className="my-2 border-l-2 border-emerald-500 pl-3 italic text-slate-600 dark:text-slate-300">{inlineMarkdown(line.slice(2))}</blockquote>);
      index += 1;
      continue;
    }

    const paragraph: string[] = [line];
    index += 1;
    while (index < lines.length && lines[index].trim() && !lines[index].startsWith("```") && !/^(#{1,3})\s+|^\s*([-*+] |\d+\. )|^> /.test(lines[index])) paragraph.push(lines[index++]);
    blocks.push(<p key={blocks.length} className="my-2 first:mt-0 last:mb-0">{inlineMarkdown(paragraph.join(" "))}</p>);
  }

  return <div className={`break-words ${className}`}>{blocks}</div>;
}
