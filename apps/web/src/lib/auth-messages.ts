export type AuthMode = "login" | "signup";

export function mapAuthErrorMessage(mode: AuthMode, message: string) {
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

export function getSignupConfirmationMessage(email: string) {
  return `Conta criada para ${email}. Agora confirme seu email para continuar.`;
}
