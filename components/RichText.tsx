import type { ReactNode } from "react";
import type { StepBlock } from "@/lib/types";

const TOKEN = /(\*\*[^*]+\*\*)|(\[[^\]]+\]\(https?:\/\/[^)\s]+\))|(https?:\/\/[^\s)]+)/g;

export function RichText({ text }: { text: string }) {
  const parts: ReactNode[] = [];
  let last = 0;
  let key = 0;
  for (const match of text.matchAll(TOKEN)) {
    const start = match.index ?? 0;
    if (start > last) parts.push(text.slice(last, start));
    const token = match[0];
    if (token.startsWith("**")) {
      parts.push(<strong key={key}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith("[")) {
      const link = token.match(/^\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)$/);
      if (link) {
        parts.push(
          <a key={key} href={link[2]} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
            {link[1]}
          </a>,
        );
      } else parts.push(token);
    } else {
      parts.push(
        <a key={key} href={token} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline break-all">
          {token.replace(/^https?:\/\//, "")}
        </a>,
      );
    }
    last = start + token.length;
    key += 1;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <>{parts}</>;
}

export function Paragraphs({ text }: { text: string }) {
  const paragraphs = text.split(/\n\n+/).map((part) => part.trim()).filter(Boolean);
  return (
    <div className="space-y-2">
      {paragraphs.map((paragraph) => (
        <p key={paragraph.slice(0, 40)} className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
          <RichText text={paragraph} />
        </p>
      ))}
    </div>
  );
}

export function Steps({ steps }: { steps: StepBlock[] }) {
  let number = 0;
  return (
    <div className="space-y-3">
      {steps.map((block, index) => {
        if (block.type === "heading") {
          number = 0;
          return (
            <h3 key={index} className="text-sm font-bold text-gray-900 pt-2">
              {block.text}
            </h3>
          );
        }
        if (block.type === "note") {
          return (
            <div key={index} className="p-4 bg-lime-50 border border-lime-100 rounded-xl text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
              <RichText text={block.text} />
            </div>
          );
        }
        number += 1;
        return (
          <div key={index} className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
            <span className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0">
              {number}
            </span>
            <p className="text-sm text-gray-900 leading-relaxed">
              <RichText text={block.text} />
            </p>
          </div>
        );
      })}
    </div>
  );
}
