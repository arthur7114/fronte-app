"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  Loader2,
  X,
} from "lucide-react";
import { getSignupConfirmationMessage, mapAuthErrorMessage } from "@/lib/auth-messages";
import { getBrowserSupabaseClient } from "@/lib/supabase/browser";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type AuthFormProps = {
  mode: "login" | "signup";
};

export function AuthForm({ mode }: AuthFormProps) {
  const isSignup = mode === "signup";
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const passwordStrength = useMemo(() => {
    if (!password) return 0;

    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;
    return strength;
  }, [password]);

  const strengthColor = useMemo(() => {
    if (passwordStrength <= 25) return "bg-red-500";
    if (passwordStrength <= 50) return "bg-orange-500";
    if (passwordStrength <= 75) return "bg-yellow-500";
    return "bg-teal-500";
  }, [passwordStrength]);

  const strengthText = useMemo(() => {
    if (passwordStrength === 0) return "";
    if (passwordStrength <= 25) return "Fraca";
    if (passwordStrength <= 50) return "Media";
    if (passwordStrength <= 75) return "Boa";
    return "Forte";
  }, [passwordStrength]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const supabase = getBrowserSupabaseClient();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const pwd = isSignup ? password : String(formData.get("password") ?? "");
    const firstName = String(formData.get("firstName") ?? "").trim();
    const lastName = String(formData.get("lastName") ?? "").trim();

    if (isSignup) {
      if (password !== confirmPassword) {
        setError("As senhas nao coincidem.");
        return;
      }

      if (passwordStrength < 50) {
        setError("A senha e muito fraca. Tente adicionar numeros ou simbolos.");
        return;
      }
    }

    setIsPending(true);
    setError(null);
    setSuccess(null);

    try {
      const result = isSignup
        ? await supabase.auth.signUp({
            email,
            password: pwd,
            options: {
              emailRedirectTo: `${window.location.origin}/auth/callback`,
              data: {
                full_name: `${firstName} ${lastName}`.trim(),
              },
            },
          })
        : await supabase.auth.signInWithPassword({ email, password: pwd });

      if (result.error) {
        setError(mapAuthErrorMessage(mode, result.error.message));
        return;
      }

      if (isSignup && !result.data.session) {
        setSuccess(getSignupConfirmationMessage(email));
        return;
      }

      router.push("/app");
      router.refresh();
    } catch (error) {
      setError(
        mapAuthErrorMessage(mode, error instanceof Error ? error.message : "Falha de rede"),
      );
    } finally {
      setIsPending(false);
    }
  }

  async function signInWithProvider(provider: "google" | "github") {
    const supabase = getBrowserSupabaseClient();
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-5">
        {isSignup && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="firstName" className="text-sm font-semibold text-slate-900">
                Nome
              </label>
              <Input
                id="firstName"
                name="firstName"
                required
                placeholder="Seu nome"
                disabled={isPending}
                className="h-11 border-slate-200 focus-visible:ring-teal-500"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="lastName" className="text-sm font-semibold text-slate-900">
                Sobrenome
              </label>
              <Input
                id="lastName"
                name="lastName"
                required
                placeholder="Sobrenome"
                disabled={isPending}
                className="h-11 border-slate-200 focus-visible:ring-teal-500"
              />
            </div>
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-semibold text-slate-900">
            Email
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="seu@email.com"
            disabled={isPending}
            className="h-11 border-slate-200 focus-visible:ring-teal-500"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-semibold text-slate-900">
            {isSignup ? "Escolha uma senha" : "Senha"}
          </label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required={!isSignup}
              minLength={6}
              placeholder={isSignup ? "Minimo 8 caracteres" : "Digite sua senha"}
              disabled={isPending}
              value={isSignup ? password : undefined}
              onChange={isSignup ? (event) => setPassword(event.target.value) : undefined}
              className="h-11 border-slate-200 pr-10 transition-all focus-visible:ring-teal-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-900"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {isSignup && password.length > 0 && (
            <div className="animate-in slide-in-from-top-1 space-y-2 pt-1 duration-300 fade-in">
              <div className="flex items-center justify-between gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={cn("h-full transition-all duration-500 ease-out", strengthColor)}
                    style={{ width: `${passwordStrength}%` }}
                  />
                </div>
                <span
                  className={cn(
                    "text-[10px] font-black uppercase tracking-wider",
                    strengthColor.replace("bg-", "text-"),
                  )}
                >
                  {strengthText}
                </span>
              </div>

              <ul className="grid grid-cols-2 gap-x-4 gap-y-1">
                <li
                  className={cn(
                    "flex items-center gap-1.5 text-[10px] font-bold",
                    password.length >= 8 ? "text-teal-600" : "text-slate-400",
                  )}
                >
                  {password.length >= 8 ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <div className="ml-1 h-1 w-1 rounded-full bg-current" />
                  )}
                  8+ caracteres
                </li>
                <li
                  className={cn(
                    "flex items-center gap-1.5 text-[10px] font-bold",
                    /[A-Z]/.test(password) ? "text-teal-600" : "text-slate-400",
                  )}
                >
                  {/[A-Z]/.test(password) ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <div className="ml-1 h-1 w-1 rounded-full bg-current" />
                  )}
                  Letra maiuscula
                </li>
                <li
                  className={cn(
                    "flex items-center gap-1.5 text-[10px] font-bold",
                    /[0-9]/.test(password) ? "text-teal-600" : "text-slate-400",
                  )}
                >
                  {/[0-9]/.test(password) ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <div className="ml-1 h-1 w-1 rounded-full bg-current" />
                  )}
                  Um numero
                </li>
                <li
                  className={cn(
                    "flex items-center gap-1.5 text-[10px] font-bold",
                    /[^A-Za-z0-9]/.test(password) ? "text-teal-600" : "text-slate-400",
                  )}
                >
                  {/[^A-Za-z0-9]/.test(password) ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <div className="ml-1 h-1 w-1 rounded-full bg-current" />
                  )}
                  Simbolo especial
                </li>
              </ul>
            </div>
          )}
        </div>

        {isSignup && (
          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-semibold text-slate-900">
              Confirmar Senha
            </label>
            <div className="relative">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? "text" : "password"}
                required
                placeholder="Repita sua senha"
                disabled={isPending}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className={cn(
                  "h-11 border-slate-200 transition-all focus-visible:ring-teal-500",
                  confirmPassword &&
                    password !== confirmPassword &&
                    "border-red-300 bg-red-50 focus-visible:ring-red-500",
                )}
              />
              {confirmPassword ? (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {password === confirmPassword ? (
                    <Check className="h-4 w-4 animate-in zoom-in text-teal-600 duration-300" />
                  ) : (
                    <X className="h-4 w-4 animate-in zoom-in text-red-500 duration-300" />
                  )}
                </div>
              ) : null}
            </div>
          </div>
        )}

        {!isSignup && (
          <div className="flex items-center gap-2">
            <Checkbox id="remember" />
            <label
              htmlFor="remember"
              className="cursor-pointer select-none text-sm font-medium text-slate-500"
            >
              Manter conectado
            </label>
          </div>
        )}

        {error ? (
          <div className="animate-in slide-in-from-left-2 border-l-4 border-red-600 bg-red-50 p-4 text-sm font-bold text-red-900 transition-all fade-in">
            {error}
          </div>
        ) : null}

        {success ? (
          <div className="border-l-4 border-green-600 bg-green-50 p-4 text-sm font-bold text-green-900">
            {success}
          </div>
        ) : null}

        <Button
          type="submit"
          disabled={
            isPending || (isSignup && (!password || password !== confirmPassword || passwordStrength < 50))
          }
          className="h-11 w-full bg-slate-950 text-[10px] font-bold uppercase tracking-widest text-white transition-all hover:bg-teal-600 disabled:bg-slate-400 disabled:opacity-50"
        >
          {isPending ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Processando...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              {isSignup ? "Criar conta" : "Entrar"}
              <ArrowRight className="h-4 w-4" />
            </span>
          )}
        </Button>
      </form>

      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-100" />
        </div>
        <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.2em]">
          <span className="bg-white px-4 text-slate-300">ou continue com</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          className="h-11 border-slate-200 font-bold text-xs"
          onClick={() => signInWithProvider("google")}
          disabled={isPending}
        >
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Google
        </Button>
        <Button
          variant="outline"
          className="h-11 border-slate-200 font-bold text-xs"
          onClick={() => signInWithProvider("github")}
          disabled={isPending}
        >
          <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
          </svg>
          GitHub
        </Button>
      </div>

      <p className="text-center text-sm font-medium text-slate-500">
        {isSignup ? "Ja tem conta?" : "Ainda nao tem conta?"}{" "}
        <Link
          href={isSignup ? "/login" : "/cadastro"}
          className="font-bold text-teal-600 transition-colors hover:text-teal-700"
        >
          {isSignup ? "Entrar" : "Criar conta"}
        </Link>
      </p>
    </div>
  );
}
