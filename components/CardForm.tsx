"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { removeItemFile, saveItemAnswers, uploadItemFile } from "@/lib/actions";
import { mergeAnswers } from "@/lib/form-answers";
import type { Answers, FormField, FormSchema, ItemFile } from "@/lib/types";
import { fieldClass } from "@/components/Shell";

let pendingSave = Promise.resolve();

export function flushCardSave() {
  return pendingSave;
}

export function CardForm({
  itemId,
  schema,
  initial,
  locked,
}: {
  itemId: string;
  schema: FormSchema;
  initial: Answers;
  locked: boolean;
}) {
  const [answers, setAnswers] = useState(() => mergeAnswers(schema, initial));
  const [saved, setSaved] = useState<boolean | null>(null);
  const [, startTransition] = useTransition();
  const timer = useRef(0);

  function update(next: Answers) {
    setAnswers(next);
    if (locked) return;
    setSaved(false);
    window.clearTimeout(timer.current);
    pendingSave = new Promise((resolve) => {
      timer.current = window.setTimeout(() => {
        startTransition(async () => {
          await saveItemAnswers(itemId, next);
          setSaved(true);
          resolve();
        });
      }, 400);
    });
  }

  return (
    <div className="space-y-4">
      <Fields fields={schema.fields} answers={answers} locked={locked} onChange={update} />
      <p className="text-xs text-gray-400">{locked ? "Sent for review." : saved === null ? "" : saved ? "Saved" : "Saving…"}</p>
    </div>
  );
}

function Fields({
  fields,
  answers,
  locked,
  onChange,
}: {
  fields: FormField[];
  answers: Answers;
  locked: boolean;
  onChange: (next: Answers) => void;
}) {
  const none = answers.none === true;
  return (
    <div className="space-y-4">
      {fields.map((field, index) => {
        if (field.kind === "note") {
          return (
            <p key={`note-${index}`} className="text-sm text-gray-600">
              {field.text}
            </p>
          );
        }
        if (field.kind === "group") {
          return (
            <fieldset key={field.label ?? index} className="space-y-4 rounded-xl border border-gray-200 p-4">
              {field.label ? <legend className="px-1 text-sm font-bold text-gray-900">{field.label}</legend> : null}
              <Fields fields={field.fields} answers={answers} locked={locked} onChange={onChange} />
            </fieldset>
          );
        }
        if (field.kind === "repeat") {
          if (none && field.name === "tools") return null;
          const list = Array.isArray(answers[field.name]) ? (answers[field.name] as Answers[]) : [];
          const setRow = (rowIndex: number, row: Answers) => {
            const next = list.map((entry, entryIndex) => (entryIndex === rowIndex ? row : entry));
            onChange({ ...answers, [field.name]: next });
          };
          return (
            <div key={field.name} className="space-y-3">
              {list.map((row, rowIndex) => (
                <div key={rowIndex} className="space-y-3 rounded-xl border border-gray-200 p-4">
                  {field.max === field.min ? <p className="text-xs font-semibold text-gray-400">{rowIndex + 1}</p> : null}
                  <Fields fields={field.fields} answers={row} locked={locked} onChange={(next) => setRow(rowIndex, next)} />
                  {field.max !== field.min && list.length > (field.min ?? 0) ? (
                    <button
                      type="button"
                      className="text-xs font-semibold text-gray-400 hover:text-gray-900"
                      disabled={locked}
                      onClick={() => onChange({ ...answers, [field.name]: list.filter((_, entryIndex) => entryIndex !== rowIndex) })}
                    >
                      Remove
                    </button>
                  ) : null}
                </div>
              ))}
              {field.max !== field.min ? (
                <button
                  type="button"
                  className="text-sm font-semibold text-gray-700"
                  disabled={locked}
                  onClick={() => onChange({ ...answers, [field.name]: [...list, mergeAnswers({ fields: field.fields }, null)] })}
                >
                  {field.addLabel}
                </button>
              ) : null}
            </div>
          );
        }
        if (field.kind === "colors") {
          const value = (answers[field.name] as { useLogo?: boolean; colors?: string[] } | undefined) ?? { useLogo: false, colors: ["#111111"] };
          const colors = value.colors ?? ["#111111"];
          return (
            <div key={field.name} className="space-y-3">
              <label className="flex items-center gap-2 text-sm text-gray-800">
                <input
                  type="checkbox"
                  checked={Boolean(value.useLogo)}
                  disabled={locked}
                  onChange={(event) => onChange({ ...answers, [field.name]: { ...value, useLogo: event.target.checked } })}
                />
                {field.orLabel}
              </label>
              {value.useLogo ? null : (
                <div className="space-y-2">
                  {colors.map((color, colorIndex) => (
                    <div key={colorIndex} className="flex items-center gap-2">
                      <input
                        type="color"
                        value={/^#[0-9a-fA-F]{6}$/.test(color) ? color : "#111111"}
                        disabled={locked}
                        aria-label={`Color ${colorIndex + 1}`}
                        onChange={(event) => {
                          const next = colors.map((entry, entryIndex) => (entryIndex === colorIndex ? event.target.value : entry));
                          onChange({ ...answers, [field.name]: { ...value, colors: next } });
                        }}
                      />
                      <span className="text-sm text-gray-600">{color}</span>
                      {colors.length > 1 ? (
                        <button
                          type="button"
                          className="text-xs font-semibold text-gray-400"
                          disabled={locked}
                          onClick={() =>
                            onChange({ ...answers, [field.name]: { ...value, colors: colors.filter((_, entryIndex) => entryIndex !== colorIndex) } })
                          }
                        >
                          Remove
                        </button>
                      ) : null}
                    </div>
                  ))}
                  {colors.length < field.max ? (
                    <button
                      type="button"
                      className="text-sm font-semibold text-gray-700"
                      disabled={locked}
                      onClick={() => onChange({ ...answers, [field.name]: { ...value, colors: [...colors, "#111111"] } })}
                    >
                      Add a color
                    </button>
                  ) : null}
                </div>
              )}
            </div>
          );
        }
        if (field.kind === "url-na") {
          const value = (answers[field.name] as { url?: string; na?: boolean } | undefined) ?? { url: "", na: false };
          return (
            <div key={field.name} className="grid gap-2 sm:grid-cols-[8rem_1fr_auto] sm:items-center">
              <span className="text-sm font-semibold text-gray-900">{field.label}</span>
              <input
                type="url"
                value={value.url ?? ""}
                disabled={locked || value.na}
                placeholder="https://"
                className={fieldClass}
                onChange={(event) => onChange({ ...answers, [field.name]: { ...value, url: event.target.value } })}
              />
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={Boolean(value.na)}
                  disabled={locked}
                  onChange={(event) => onChange({ ...answers, [field.name]: { ...value, na: event.target.checked } })}
                />
                N/A
              </label>
            </div>
          );
        }
        if (field.kind === "checkbox") {
          return (
            <label key={field.name} className="flex items-center gap-2 text-sm text-gray-800">
              <input
                type="checkbox"
                checked={answers[field.name] === true}
                disabled={locked}
                onChange={(event) => onChange({ ...answers, [field.name]: event.target.checked })}
              />
              {field.label}
            </label>
          );
        }
        if (field.kind === "select") {
          return (
            <label key={field.name} className="block">
              <span className="text-[10px] text-gray-400 uppercase font-semibold tracking-wide">{field.label}</span>
              <select
                value={typeof answers[field.name] === "string" ? (answers[field.name] as string) : ""}
                disabled={locked}
                className={`${fieldClass} mt-1.5`}
                onChange={(event) => onChange({ ...answers, [field.name]: event.target.value })}
              >
                <option value="">Choose one</option>
                {field.options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          );
        }
        const inputType = field.kind === "email" ? "email" : field.kind === "url" ? "url" : "text";
        return (
          <label key={field.name} className="block">
            <span className="text-[10px] text-gray-400 uppercase font-semibold tracking-wide">{field.label}</span>
            {field.kind === "textarea" ? (
              <textarea
                value={typeof answers[field.name] === "string" ? (answers[field.name] as string) : ""}
                disabled={locked}
                rows={3}
                className={`${fieldClass} mt-1.5`}
                onChange={(event) => onChange({ ...answers, [field.name]: event.target.value })}
              />
            ) : (
              <input
                type={inputType}
                value={typeof answers[field.name] === "string" ? (answers[field.name] as string) : ""}
                disabled={locked}
                className={`${fieldClass} mt-1.5`}
                onChange={(event) => onChange({ ...answers, [field.name]: event.target.value })}
              />
            )}
            {field.help ? <span className="mt-1 block text-xs text-gray-500">{field.help}</span> : null}
          </label>
        );
      })}
    </div>
  );
}

export function FileCard({
  itemId,
  folder,
  files,
  locked,
}: {
  itemId: string;
  folder: string;
  files: ItemFile[];
  locked: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-600">
        Upload files for the <span className="font-semibold text-gray-900">{folder}</span> folder. Name each file to match a name in the Team tab of your content doc.
      </p>
      {files.length ? (
        <ul className="space-y-2">
          {files.map((file) => (
            <li key={file.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
              <a href={`/onboarding/file/${file.id}`} className="font-semibold text-blue-600 underline break-all">
                {file.filename}
              </a>
              {locked ? null : (
                <form
                  action={async (data) => {
                    await removeItemFile(data);
                    router.refresh();
                  }}
                >
                  <input type="hidden" name="fileId" value={file.id} />
                  <button type="submit" className="text-xs font-semibold text-gray-400 hover:text-gray-900">
                    Remove
                  </button>
                </form>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-500">No files uploaded yet.</p>
      )}
      {locked ? null : (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            data.set("itemId", itemId);
            setError("");
            startTransition(async () => {
              const result = await uploadItemFile(data);
              if (result.error) setError(result.error);
              else {
                event.currentTarget.reset();
                router.refresh();
              }
            });
          }}
        >
          <input name="file" type="file" accept="image/*,.pdf" className="block w-full text-sm" />
          <button type="submit" className="mt-2 text-sm font-semibold text-gray-900" disabled={pending}>
            {pending ? "Uploading…" : "Upload"}
          </button>
          {error ? <p className="mt-2 text-sm text-rose-700">{error}</p> : null}
        </form>
      )}
    </div>
  );
}
