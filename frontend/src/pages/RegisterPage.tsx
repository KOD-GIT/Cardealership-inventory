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

// Same rules the API enforces: at least 8 characters, and at most 72 BYTES (bcrypt's limit).
// There is no role field on purpose: new accounts are always regular users, and the server enforces that too.
const schema = z
  .object({
    email: z.string().trim().min(1, "Enter your email").email("Enter a valid email address"),
    password: z.string().min(8, "Use at least 8 characters").refine((value) => new TextEncoder().encode(value).length <= 72, "Use at most 72 bytes"),
    confirm: z.string().min(1, "Re-enter your password"),
  })
  .refine((v) => v.password === v.confirm, { path: ["confirm"], message: "Passwords don't match" });
type Values = z.infer<typeof schema>;

export default function RegisterPage() {
  useDocumentTitle("Create account");
  const { register: signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = safeReturnPath((location.state as { from?: string } | null)?.from);
  const [formError, setFormError] = useState<string | undefined>();
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<Values>({ resolver: zodResolver(schema) });

  const onSubmit = handleSubmit(async ({ email, password }) => {
    setFormError(undefined);
    try {
      await signUp(email, password);
      navigate(from, { replace: true });
    } catch (error) {
      if (apiErrorStatus(error) === 409) setError("email", { message: "Email already registered. Try signing in instead." });
      else setFormError(apiErrorMessage(error));
    }
  });

  return (
    <AuthShell overline="Account / Register" title="Create account" subtitle="Register to browse and purchase vehicles. No payment details are asked for.">
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
        {formError ? <p role="alert" className="border border-signal p-3 text-sm font-medium text-signal">{formError}</p> : null}
        <TextField label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register("email")} />
        <PasswordField label="Password" autoComplete="new-password" hint="At least 8 characters." error={errors.password?.message} {...register("password")} />
        <PasswordField label="Confirm password" autoComplete="new-password" error={errors.confirm?.message} {...register("confirm")} />
        <Button type="submit" variant="signal" loading={isSubmitting} className="mt-2 w-full">Create account</Button>
      </form>
      <p className="mt-8 text-sm text-dim">
        Already have an account? <Link to="/login" state={{ from }} className="font-semibold text-bone underline underline-offset-4 hover:text-signal">Sign in</Link>
      </p>
    </AuthShell>
  );
}
