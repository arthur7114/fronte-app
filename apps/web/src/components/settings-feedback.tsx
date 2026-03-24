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
        <p className="rounded-[20px] border border-[#dc2626]/15 bg-[#fff7f7] px-4 py-3 text-sm leading-7 text-[#b91c1c]">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p className="rounded-[20px] border border-[#16a34a]/15 bg-[#f0fdf4] px-4 py-3 text-sm leading-7 text-[#15803d]">
          {state.success}
        </p>
      ) : null}
    </div>
  );
}
