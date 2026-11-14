import { summarizeAnswers } from "@/lib/form-answers";
import { summarizeMenu } from "@/lib/menu";
import type { Answers, FormSchema, ItemFile } from "@/lib/types";

export function AnswerSummary({ schema, answers }: { schema: FormSchema; answers: Answers }) {
  const lines = summarizeAnswers(schema, answers);
  if (!lines.length) return <p className="text-sm text-gray-500">No answers yet.</p>;
  return (
    <dl className="space-y-2">
      {lines.map((line, index) => (
        <div key={`${line.label}-${index}`}>
          <dt className="text-[10px] uppercase font-semibold tracking-wide text-gray-400">{line.label}</dt>
          <dd className="text-sm text-gray-900 whitespace-pre-wrap break-words">{line.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function MenuSummary({ answers }: { answers: Answers }) {
  const lines = summarizeMenu(answers);
  if (!lines.length) return <p className="text-sm text-gray-500">No answers yet.</p>;
  return (
    <dl className="space-y-2">
      {lines.map((line) => (
        <div key={`${line.label}-${line.value}`}>
          <dt className="text-[10px] uppercase font-semibold tracking-wide text-gray-400">{line.label}</dt>
          <dd className="text-sm text-gray-900 whitespace-pre-wrap break-words">{line.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function FileSummary({ files }: { files: ItemFile[] }) {
  if (!files.length) return <p className="text-sm text-gray-500">No files uploaded yet.</p>;
  return (
    <ul className="space-y-1">
      {files.map((file) => (
        <li key={file.id}>
          <a href={`/file/${file.id}`} className="text-sm font-semibold text-blue-600 underline break-all">
            {file.filename}
          </a>
        </li>
      ))}
    </ul>
  );
}
