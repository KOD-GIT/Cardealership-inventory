import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";
import { AuthLayout } from "../components/layout/AuthLayout";
import { Button } from "../components/ui/Button";
import { PasswordField, TextField } from "../components/ui/Field";
import { useAuth } from "../context/AuthContext";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { apiErrorMessage, apiErrorStatus } from "../lib/errors";

const schema = z.object({
  email: z.string().trim().min(1, "Enter your email").email("Enter a valid email address"),
  password: z.string().min(1, "Enter your password"),
});
type Values = z.infer<typeof schema>;

export default function LoginPage() {
  useDocumentTitle("Sign in");
  const { login } = useAuth();
  const navigate = useNavigate();
  const from = (useLocation().state as { from?: string } | null)?.from ?? "/";
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
    <AuthLayout title="Sign in" subtitle="Welcome back. Sign in to browse the showroom.">
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        {formError ? <p role="alert" className="rounded-lg bg-danger-tint p-3 text-sm font-medium text-danger">{formError}</p> : null}
        <TextField label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register("email")} />
        <PasswordField label="Password" autoComplete="current-password" error={errors.password?.message} {...register("password")} />
        <Button type="submit" loading={isSubmitting} className="mt-2 w-full">Sign in</Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted">
        New here? <Link to="/register" className="font-semibold text-brand underline underline-offset-2">Create an account</Link>
      </p>
    </AuthLayout>
  );
}
