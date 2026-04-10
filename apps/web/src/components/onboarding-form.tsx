"use client";

import { useActionState, useState } from "react";
import { createTenant, type OnboardingState } from "@/app/onboarding/actions";
import { normalizeTenantSlug } from "@/lib/tenant";

const initialState: OnboardingState = {};

export function OnboardingForm() {
  const [state, formAction, isPending] = useActionState(createTenant, initialState);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);

  return (
    <section className="dashboard-surface rounded-lg p-6 sm:p-8">
      <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[1fr_0.8fr]">
        <div className="space-y-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-black/45">
              Primeiros passos
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-black">
              Defina o primeiro espaco de trabalho.
            </h2>
          </div>

          <form action={formAction} className="space-y-4">
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-black/45">
                Nome do espaco de trabalho
              </span>
              <input
                name="name"
                type="text"
                required
                value={name}
                onChange={(event) => {
                  const nextName = event.target.value;

                  setName(nextName);

                  if (!slugTouched) {
                    setSlug(normalizeTenantSlug(nextName));
                  }
                }}
                placeholder="Super Editorial"
                className="w-full rounded-lg border border-border bg-white px-4 py-4 text-base outline-none transition placeholder:text-black/30 focus:border-primary focus:shadow-[0_0_0_4px_rgba(18,179,166,0.12)]"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-black/45">
                Slug do espaco de trabalho
              </span>
              <input
                name="slug"
                type="text"
                required
                value={slug}
                onChange={(event) => {
                  setSlugTouched(true);
                  setSlug(normalizeTenantSlug(event.target.value));
                }}
                placeholder="super-editorial"
                className="w-full rounded-lg border border-border bg-white px-4 py-4 text-base outline-none transition placeholder:text-black/30 focus:border-primary focus:shadow-[0_0_0_4px_rgba(18,179,166,0.12)]"
              />
            </label>

            {state.error ? (
              <p className="border border-[#b3422f]/20 bg-[#b3422f]/8 px-4 py-3 text-sm text-[#b3422f]">
                {state.error}
              </p>
            ) : null}

            <div className="flex flex-col gap-3 pt-2">
              <button
                type="submit"
                disabled={isPending}
                className="inline-flex h-12 items-center justify-center rounded-lg bg-primary px-5 text-sm font-semibold uppercase tracking-[0.24em] text-primary-foreground transition duration-200 hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-60"
              >
                {isPending ? "Criando espaco..." : "Criar espaco"}
              </button>
            </div>
          </form>
        </div>

        <div className="rounded-lg border border-border bg-secondary/35 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-black/45">
            O que este bloco valida
          </p>

          <ul className="mt-4 space-y-3 text-sm leading-7 text-black/68">
            <li>O acesso da conta ja esta ativo.</li>
            <li>O primeiro espaco de trabalho ganha um slug proprio.</li>
            <li>O painel vai usar esse contexto imediatamente.</li>
          </ul>

          <div className="mt-6 border-t border-black/10 pt-4 text-sm text-black/52">
            Configuracao do blog e fluxos editoriais ficam fora deste bloco de proposito.
          </div>
        </div>
      </div>
    </section>
  );
}
