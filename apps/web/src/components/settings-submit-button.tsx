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
      className="inline-flex h-12 items-center justify-center rounded-full border border-[#f97316] bg-[#f97316] px-5 text-sm font-semibold uppercase tracking-[0.24em] text-white shadow-[0_16px_36px_rgba(249,115,22,0.18)] transition duration-200 hover:-translate-y-0.5 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? pendingLabel : label}
    </button>
  );
}
