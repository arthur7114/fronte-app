import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { AnchorHTMLAttributes } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthForm } from "@/components/auth-form";

const push = vi.fn();
const refresh = vi.fn();
const signInWithPassword = vi.fn();
const signUp = vi.fn();
const signInWithOAuth = vi.fn();

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push,
    refresh,
  }),
}));

vi.mock("@/lib/supabase/browser", () => ({
  getBrowserSupabaseClient: () => ({
    auth: {
      signInWithOAuth,
      signInWithPassword,
      signUp,
    },
  }),
}));

function fillAuthForm(email = "user@example.com", password = "secret123") {
  fireEvent.change(screen.getByLabelText(/email/i), {
    target: { value: email },
  });
  fireEvent.change(screen.getByLabelText(/^senha$/i), {
    target: { value: password },
  });
}

describe("AuthForm", () => {
  beforeEach(() => {
    push.mockReset();
    refresh.mockReset();
    signInWithPassword.mockReset();
    signUp.mockReset();
    signInWithOAuth.mockReset();
  });

  it("logs in and sends the user to /app", async () => {
    signInWithPassword.mockResolvedValue({
      data: { session: { access_token: "token" } },
      error: null,
    });

    render(<AuthForm mode="login" />);
    fillAuthForm();

    fireEvent.submit(screen.getByRole("button", { name: /entrar/i }).closest("form")!);

    await waitFor(() => {
      expect(signInWithPassword).toHaveBeenCalledWith({
        email: "user@example.com",
        password: "secret123",
      });
      expect(push).toHaveBeenCalledWith("/app");
      expect(refresh).toHaveBeenCalled();
    });
  });

  it("shows a confirmation message after signup without a session", async () => {
    signUp.mockResolvedValue({
      data: { session: null },
      error: null,
    });

    render(<AuthForm mode="signup" />);
    fireEvent.change(screen.getByLabelText(/^nome$/i), {
      target: { value: "New" },
    });
    fireEvent.change(screen.getByLabelText(/^sobrenome$/i), {
      target: { value: "User" },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "new@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/escolha uma senha/i), {
      target: { value: "Secret123!" },
    });
    fireEvent.change(screen.getByLabelText(/confirmar senha/i), {
      target: { value: "Secret123!" },
    });

    fireEvent.submit(screen.getByRole("button", { name: /criar conta/i }).closest("form")!);

    expect(
      await screen.findByText(
        "Conta criada para new@example.com. Agora confirme seu email para continuar.",
      ),
    ).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });

  it("shows a translated login error", async () => {
    signInWithPassword.mockResolvedValue({
      data: { session: null },
      error: { message: "Invalid login credentials" },
    });

    render(<AuthForm mode="login" />);
    fillAuthForm();

    fireEvent.submit(screen.getByRole("button", { name: /entrar/i }).closest("form")!);

    expect(await screen.findByText("Email ou senha invalidos.")).toBeInTheDocument();
  });

  it("keeps the submit button disabled while the request is pending", async () => {
    let resolveAuth:
      | ((value: { data: { session: null }; error: null }) => void)
      | undefined;

    signInWithPassword.mockReturnValue(
      new Promise((resolve) => {
        resolveAuth = resolve;
      }),
    );

    render(<AuthForm mode="login" />);
    fillAuthForm();

    const button = screen.getByRole("button", { name: /entrar/i });
    fireEvent.submit(button.closest("form")!);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /processando/i })).toBeDisabled();
    });

    resolveAuth?.({ data: { session: null }, error: null });

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /entrar/i })).not.toBeDisabled();
    });
  });
});
