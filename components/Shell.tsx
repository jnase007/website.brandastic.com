import { LOGO_SRC } from "@/lib/brand";

export function Shell({
  children,
  actions,
  footer,
}: {
  children: React.ReactNode;
  actions?: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <>
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-5 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
          <a href="https://brandastic.com" className="shrink-0" aria-label="Brandastic">
            <img src={LOGO_SRC} alt="Brandastic" className="h-3.5 w-auto" />
          </a>
          {actions ? <div className="flex flex-wrap items-center justify-end gap-2">{actions}</div> : null}
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-5 sm:px-6 py-8 sm:py-10">{children}</main>
      <footer className="border-t border-gray-200 mt-12">
        <div className="max-w-4xl mx-auto px-6 py-6 text-center text-xs text-gray-400">
          {footer ?? (
            <>
              © {new Date().getFullYear()} Brandastic ·{" "}
              <a href="https://brandastic.com" target="_blank" rel="noopener noreferrer" className="hover:text-gray-600">
                brandastic.com
              </a>
            </>
          )}
        </div>
      </footer>
    </>
  );
}

export const btnPrimary =
  "inline-flex items-center justify-center text-sm font-semibold bg-gray-900 text-white px-4 py-2.5 rounded-full hover:bg-gray-700 transition";

export const btnGhost =
  "inline-flex items-center justify-center text-sm font-semibold text-gray-900 bg-white border border-gray-300 px-4 py-2.5 rounded-full hover:bg-gray-50 transition";

export const fieldClass =
  "w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-gray-900";
