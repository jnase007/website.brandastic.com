"use client";

import { useActionState } from "react";
import { login, type ActionState } from "@/lib/actions";
import { Shell, btnPrimary, fieldClass } from "@/components/Shell";

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, {} as ActionState);

  return (
    <Shell>
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-extrabold text-center">Website intake</h1>
        <p className="text-gray-500 text-center mt-2 mb-6">Sandy’s admin</p>
        <form action={action} className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
          {state.error ? <p className="text-sm text-rose-700">{state.error}</p> : null}
          <label className="block">
            <span className="text-[10px] text-gray-400 uppercase font-semibold tracking-wide">Password</span>
            <input name="password" type="password" required autoFocus className={`${fieldClass} mt-1.5`} />
          </label>
          <button type="submit" disabled={pending} className={`${btnPrimary} w-full`}>
            {pending ? "Checking…" : "Continue"}
          </button>
        </form>
      </div>
    </Shell>
  );
}
