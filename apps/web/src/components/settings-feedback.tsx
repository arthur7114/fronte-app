"use client";

import type { SettingsState } from "@/app/app/settings/actions";

type SettingsFeedbackProps = {
  state: SettingsState;
};

export function SettingsFeedback({ state }: SettingsFeedbackProps) {
  if (!state.error && !state.success) {
    return null;
  }

  return (
    <div aria-live="polite" className="space-y-3">
      {state.error ? (
        <p className="rounded-lg border border-danger/15 bg-danger/10 px-4 py-3 text-sm leading-7 text-danger">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p className="rounded-lg border border-success/15 bg-success/10 px-4 py-3 text-sm leading-7 text-success">
          {state.success}
        </p>
      ) : null}
    </div>
  );
}
