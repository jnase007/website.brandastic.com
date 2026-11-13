import type { ReactNode } from "react";
import type { StepBlock } from "@/lib/types";

const PATTERNS = [
  { kind: "bold", re: /\*\*[^*]+\*\*/g },
  { kind: "markdown", re: /\[[^\]]+\]\(https?:\/\/[^)\s]+\)/g },
  { kind: "url", re: /https?:\/\/[^\s)]+/g },
  { kind: "email", re: /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g },
  { kind: "domain", re: /\b(?:[a-z0-9-]+\.)+[a-z]{2,}(?:\/[a-z0-9._~:/?#@!$&'()*+,;=%-]*)?/gi },
] as const;

function isExampleHost(host: string) {
  return /yourcompany|yourstore|ourdomain|yourdomain|example\.com/i.test(host);
}

function nextToken(text: string, from: number) {
  let best: { index: number; text: string; kind: (typeof PATTERNS)[number]["kind"] } | null = null;
  for (const pattern of PATTERNS) {
    pattern.re.lastIndex = from;
    let match = pattern.re.exec(text);
    while (match && pattern.kind === "domain" && isExampleHost(match[0])) match = pattern.re.exec(text);
    if (!match || match.index === undefined) continue;
    if (!best || match.index < best.index) best = { index: match.index, text: match[0], kind: pattern.kind };
  }
  return best;
}

export function RichText({ text }: { text: string }) {
  const parts: ReactNode[] = [];
  let cursor = 0;
  let key = 0;
  while (cursor < text.length) {
    const token = nextToken(text, cursor);
    if (!token) {
      parts.push(text.slice(cursor));
      break;
    }
    if (token.index > cursor) parts.push(text.slice(cursor, token.index));
    if (token.kind === "bold") {
      parts.push(<strong key={key}>{token.text.slice(2, -2)}</strong>);
    } else if (token.kind === "markdown") {
      const link = token.text.match(/^\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)$/);
      parts.push(
        link ? (
          <a key={key} href={link[2]} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
            {link[1]}
          </a>
        ) : (
          token.text
        ),
      );
    } else if (token.kind === "url") {
      parts.push(
        <a key={key} href={token.text} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline break-all">
          {token.text.replace(/^https?:\/\//, "").replace(/\/$/, "")}
        </a>,
      );
    } else if (token.kind === "email") {
      parts.push(
        <strong key={key} className="font-semibold text-gray-900">
          {token.text}
        </strong>,
      );
    } else {
      parts.push(
        <a
          key={key}
          href={`https://${token.text}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline break-all"
        >
          {token.text.replace(/\/$/, "")}
        </a>,
      );
    }
    cursor = token.index + token.text.length;
    key += 1;
  }
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

function splitStep(text: string) {
  const match = text.match(/^([^.]{2,72})\.\s+(\S[\s\S]+)$/);
  if (!match) return { title: text, detail: null as string | null };
  return { title: match[1], detail: match[2] };
}

export function GuideSteps({ steps }: { steps: StepBlock[] }) {
  let letter = 0;
  return (
    <div className="space-y-3">
      {steps.map((block, index) => {
        if (block.type === "heading") {
          letter = 0;
          return (
            <h3 key={index} className="text-sm font-bold text-gray-900 pt-2">
              {block.text}
            </h3>
          );
        }
        if (block.type === "note") {
          return (
            <div key={index} className="p-4 bg-lime-50 border border-lime-100 rounded-xl text-sm text-gray-800 leading-relaxed">
              <RichText text={block.text} />
            </div>
          );
        }
        letter += 1;
        const { title, detail } = splitStep(block.text);
        const marker = letter <= 26 ? String.fromCharCode(96 + letter) : String(letter);
        return (
          <div key={index} className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
            <span className="w-7 h-7 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
              {marker}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 leading-relaxed">
                <RichText text={title} />
              </p>
              {detail ? (
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                  <RichText text={detail} />
                </p>
              ) : null}
            </div>
          </div>
        );
      })}
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
