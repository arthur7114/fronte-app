"use client";

type SettingsSubmitButtonProps = {
  pending: boolean;
  label: string;
  pendingLabel: string;
};

export function SettingsSubmitButton({
  pending,
  label,
  pendingLabel,
}: SettingsSubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-12 items-center justify-center rounded-lg bg-primary px-5 text-sm font-semibold uppercase tracking-[0.24em] text-primary-foreground shadow-[0_16px_36px_rgba(18,179,166,0.18)] transition duration-200 hover:-translate-y-0.5 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? pendingLabel : label}
    </button>
  );
}
