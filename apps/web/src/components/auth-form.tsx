"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { getBrowserSupabaseClient } from "@/lib/supabase/browser";

type AuthFormProps = {
  mode: "login" | "signup";
};

export function AuthForm({ mode }: AuthFormProps) {
  const isSignup = mode === "signup";
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  function mapAuthError(message: string) {
    const normalized = message.toLowerCase();

    if (normalized.includes("failed to fetch")) {
      return "Nao foi possivel conectar ao Supabase. Verifique as credenciais, a URL do projeto e se o ambiente esta ativo.";
    }

    if (normalized.includes("invalid login credentials")) {
      return "Email ou senha invalidos.";
    }

    if (normalized.includes("email not confirmed")) {
      return "Seu email ainda nao foi confirmado. Confira sua caixa de entrada antes de entrar.";
    }

    if (normalized.includes("signup is disabled")) {
      return "O cadastro por email esta desabilitado no Supabase.";
    }

    if (normalized.includes("user already registered")) {
      return "Este email ja esta cadastrado. Entre com sua conta para continuar.";
    }

    return mode === "signup"
      ? "Nao foi possivel criar sua conta agora."
      : "Nao foi possivel fazer login agora.";
  }

  async function handleSubmit(formData: FormData) {
    const supabase = getBrowserSupabaseClient();
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    setIsPending(true);
    setError(null);
    setSuccess(null);

    let result;

    try {
      result = isSignup
        ? await supabase.auth.signUp({ email, password })
        : await supabase.auth.signInWithPassword({ email, password });
    } catch (error) {
      setIsPending(false);
      setError(
        mapAuthError(error instanceof Error ? error.message : "Falha de rede"),
      );
      return;
    }

    setIsPending(false);

    if (result.error) {
      setError(mapAuthError(result.error.message));
      return;
    }

    if (isSignup && !result.data.session) {
      setSuccess(
        `Conta criada para ${email}. Agora confirme seu email para continuar para o onboarding.`,
      );
      return;
    }

    router.push(isSignup ? "/onboarding" : "/app");
    router.refresh();
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <label className="block">
        <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-[#2563eb]">
          Email
        </span>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="voce@empresa.com"
          className="w-full border border-black/12 bg-[#f8fafc] px-4 py-4 text-base text-[#1e293b] outline-none transition placeholder:text-[#94a3b8] focus:border-[#2563eb] focus:shadow-[0_0_0_4px_rgba(37,99,235,0.12)]"
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-[#2563eb]">
          Senha
        </span>
        <input
          name="password"
          type="password"
          required
          minLength={6}
          autoComplete={isSignup ? "new-password" : "current-password"}
          placeholder="Pelo menos 6 caracteres"
          className="w-full border border-black/12 bg-[#f8fafc] px-4 py-4 text-base text-[#1e293b] outline-none transition placeholder:text-[#94a3b8] focus:border-[#2563eb] focus:shadow-[0_0_0_4px_rgba(37,99,235,0.12)]"
        />
      </label>

      {error ? (
        <p className="border border-[#b3422f]/20 bg-[#fff0ec] px-4 py-3 text-sm text-[#b3422f]">
          {error}
        </p>
      ) : null}

      {success ? (
        <p className="border border-[#2f6b4f]/20 bg-[#edf7ef] px-4 py-3 text-sm text-[#2f6b4f]">
          {success}
        </p>
      ) : null}

      <div className="flex flex-col gap-3 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex h-12 items-center justify-center border border-[#f97316] bg-[#f97316] px-5 text-sm font-semibold uppercase tracking-[0.24em] text-white transition duration-200 hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-60"
        >
          {isPending
            ? "Processando..."
            : isSignup
              ? "Criar conta"
              : "Entrar"}
        </button>
      </div>

      <p className="text-sm leading-7 text-black/54">
        Email e senha sao a porta de entrada deste bloco. Depois disso, o fluxo vai
        para o onboarding ou para o painel, conforme o seu estado atual.
      </p>

      <p className="text-sm text-black/48">
        <Link
          href={isSignup ? "/auth/login" : "/auth/signup"}
          className="underline decoration-[#2563eb]/30 underline-offset-4 hover:text-[#2563eb]"
        >
          {isSignup ? "Ja tem conta? Entrar" : "Ainda nao criou conta? Criar agora"}
        </Link>
      </p>
    </form>
  );
}
