import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";
import { AuthShell } from "../components/layout/AuthShell";
import { Button } from "../components/ui/Button";
import { PasswordField, TextField } from "../components/ui/Field";
import { useAuth } from "../context/AuthContext";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { apiErrorMessage, apiErrorStatus } from "../lib/errors";
import { safeReturnPath } from "../lib/safeRedirect";

const schema = z.object({
  email: z.string().trim().min(1, "Enter your email").email("Enter a valid email address"),
  password: z.string().min(1, "Enter your password"),
});
type Values = z.infer<typeof schema>;

export default function LoginPage() {
  useDocumentTitle("Sign in");
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  // Returns to the page you were trying to reach (a vehicle, a Floor search), but only to a path on this site.
  const from = safeReturnPath((location.state as { from?: string } | null)?.from);
  const [formError, setFormError] = useState<string | undefined>();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Values>({ resolver: zodResolver(schema) });

  const onSubmit = handleSubmit(async ({ email, password }) => {
    setFormError(undefined);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (error) {
      setFormError(apiErrorStatus(error) === 401 ? "Email or password is incorrect." : apiErrorMessage(error));
    }
  });

  return (
    <AuthShell overline="Account / Sign in" title="Sign in" subtitle="Welcome back. Sign in to browse the floor.">
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
        {formError ? <p role="alert" className="border border-signal p-3 text-sm font-medium text-signal">{formError}</p> : null}
        <TextField label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register("email")} />
        <PasswordField label="Password" autoComplete="current-password" error={errors.password?.message} {...register("password")} />
        <Button type="submit" variant="signal" loading={isSubmitting} className="mt-2 w-full">Sign in</Button>
      </form>
      <p className="mt-8 text-sm text-dim">
        New here? <Link to="/register" state={{ from }} className="font-semibold text-bone underline underline-offset-4 hover:text-signal">Create an account</Link>
      </p>
    </AuthShell>
  );
}
