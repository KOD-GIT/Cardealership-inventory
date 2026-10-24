import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { AuthLayout } from "../components/layout/AuthLayout";
import { Button } from "../components/ui/Button";
import { PasswordField, TextField } from "../components/ui/Field";
import { useAuth } from "../context/AuthContext";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { apiErrorMessage, apiErrorStatus } from "../lib/errors";

// The API only requires 8+ characters, so the form asks for exactly that and nothing more.
const schema = z
  .object({
    email: z.string().trim().min(1, "Enter your email").email("Enter a valid email address"),
    password: z.string().min(8, "Use at least 8 characters"),
    confirm: z.string().min(1, "Re-enter your password"),
  })
  .refine((v) => v.password === v.confirm, { path: ["confirm"], message: "Passwords don't match" });
type Values = z.infer<typeof schema>;

export default function RegisterPage() {
  useDocumentTitle("Create account");
  const { register: signUp } = useAuth();
  const navigate = useNavigate();
  const [formError, setFormError] = useState<string | undefined>();
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<Values>({ resolver: zodResolver(schema) });

  const onSubmit = handleSubmit(async ({ email, password }) => {
    setFormError(undefined);
    try {
      await signUp(email, password);
      navigate("/", { replace: true });
    } catch (error) {
      if (apiErrorStatus(error) === 409) setError("email", { message: "Email already registered. Try signing in instead." });
      else setFormError(apiErrorMessage(error));
    }
  });

  return (
    <AuthLayout title="Create account" subtitle="Register to browse and purchase vehicles.">
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        {formError ? <p role="alert" className="rounded-lg bg-danger-tint p-3 text-sm font-medium text-danger">{formError}</p> : null}
        <TextField label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register("email")} />
        <PasswordField label="Password" autoComplete="new-password" hint="At least 8 characters." error={errors.password?.message} {...register("password")} />
        <PasswordField label="Confirm password" autoComplete="new-password" error={errors.confirm?.message} {...register("confirm")} />
        <Button type="submit" loading={isSubmitting} className="mt-2 w-full">Create account</Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted">
        Already have an account? <Link to="/login" className="font-semibold text-brand underline underline-offset-2">Sign in</Link>
      </p>
    </AuthLayout>
  );
}
