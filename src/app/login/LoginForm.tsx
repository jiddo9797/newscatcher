"use client";

import { useActionState } from "react";
import { login, type LoginState } from "./actions";

export default function LoginForm() {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(login, {});

  return (
    <form action={formAction} className="mt-8 space-y-3">
      <label htmlFor="password" className="sr-only">
        비밀번호
      </label>
      <input
        id="password"
        name="password"
        type="password"
        autoComplete="current-password"
        placeholder="비밀번호"
        required
        autoFocus
        className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
      />
      {state.error && (
        <p role="alert" className="text-sm font-medium text-rose-600">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="block w-full rounded-xl bg-indigo-600 px-4 py-3 text-center font-semibold text-white hover:bg-indigo-700 disabled:bg-zinc-300"
      >
        {pending ? "확인하고 있어요…" : "들어가기"}
      </button>
    </form>
  );
}
