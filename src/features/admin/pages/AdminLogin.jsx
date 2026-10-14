import { useRef, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import useAdminAuth from "../hooks/useAdminAuth";
import { loginAdmin } from "../services/adminAuthApi";
import { ADMIN_PATHS } from "../utils/adminUtils";
import { Button, Icon } from "@shared/components/ui/Button";
import { FormErrorBanner, FormField } from "@shared/components/ui/FormControls";
import { describedBy, fieldClass } from "@shared/components/ui/styles";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Only allow returning to an Admin page after login. */
function safeRedirect(from) {
  return typeof from === "string" && from.startsWith(`${ADMIN_PATHS.root}/`) && !from.startsWith(ADMIN_PATHS.login)
    ? from
    : ADMIN_PATHS.dashboard;
}

export default function AdminLogin() {
  const { ready, isAuthenticated, isAdmin, user, signIn } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = safeRedirect(location.state?.from);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);

  if (ready && isAdmin && !submitting) return <Navigate to={redirectTo} replace />;

  const otherAccountActive = ready && isAuthenticated && !isAdmin;

  const validate = () => {
    const next = {};
    if (!email.trim()) next.email = "Enter your email address.";
    else if (!EMAIL_PATTERN.test(email.trim())) next.email = "Enter a valid email address.";
    if (!password) next.password = "Enter your password.";
    return next;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submittingRef.current) return;

    const nextErrors = validate();
    setErrors(nextErrors);
    setFormError(null);
    if (Object.keys(nextErrors).length) return;

    submittingRef.current = true;
    setSubmitting(true);
    try {
      const { token, admin } = await loginAdmin({
        email: email.trim().toLowerCase(),
        password,
      });
      if (!admin) throw new Error("Sign-in response was incomplete. Please try again.");
      signIn(token, admin);
      navigate(redirectTo, { replace: true });
    } catch (error) {
      setErrors(error?.fieldErrors ?? {});
      const serverMessage = typeof error?.data?.message === "string" ? error.data.message : "";
      setFormError(
        error?.status === 401 || error?.status === 403
          ? serverMessage || "Incorrect email or password."
          : error?.message || "Sign-in failed. Please try again.",
      );
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <div className="hidden w-[42%] flex-col justify-between bg-slate-950 p-12 text-slate-300 lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500 text-slate-950">
            <Icon name="balance" filled className="text-[24px]" />
          </div>
          <p className="text-lg font-bold text-white">VakeelSetu</p>
        </div>
        <div className="max-w-sm">
          <h2 className="text-3xl font-bold leading-tight text-white">Publish the law people need to understand.</h2>
          <p className="mt-4 text-sm leading-relaxed text-slate-400">
            Articles, IPC and BNS references, citizens' rights, guides and platform updates — all from one workspace.
          </p>
        </div>
        <p className="text-xs text-slate-500">Authorised back office only.</p>
      </div>

      <div className="flex flex-1 items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-slate-950">
              <Icon name="balance" filled className="text-[22px]" />
            </div>
            <p className="text-lg font-bold text-slate-950">VakeelSetu</p>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-950">Vakeel Setu Back Office</h1>
          <p className="mt-1 text-sm text-slate-600">Manage legal knowledge, publishing, and system content.</p>

          <div className="mt-6 space-y-3">
            {location.state?.sessionExpired ? (
              <div role="status" className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                Your session has expired. Sign in again to continue.
              </div>
            ) : null}
            {otherAccountActive ? (
              <div role="status" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
                You're signed in as {user?.email || user?.fullName || "another account"}. Signing in here switches this
                browser to your back office account.
              </div>
            ) : null}
            <FormErrorBanner message={formError} />
          </div>

          <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-5">
            <FormField id="admin-email" label="Email Address" error={errors.email}>
              <input
                id="admin-email"
                type="email"
                autoComplete="username"
                inputMode="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={submitting}
                aria-invalid={Boolean(errors.email) || undefined}
                aria-describedby={describedBy("admin-email", { error: errors.email })}
                className={fieldClass(errors.email)}
                placeholder="admin@example.com"
              />
            </FormField>

            <FormField id="admin-password" label="Password" error={errors.password}>
              <div className="relative">
                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  disabled={submitting}
                  aria-invalid={Boolean(errors.password) || undefined}
                  aria-describedby={describedBy("admin-password", { error: errors.password })}
                  className={`${fieldClass(errors.password)} pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  className="absolute inset-y-0 right-0 flex items-center rounded-r-xl px-3 text-slate-400 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                >
                  <Icon name={showPassword ? "visibility_off" : "visibility"} className="text-[20px]" />
                </button>
              </div>
            </FormField>

            <Button type="submit" loading={submitting} className="w-full py-3">
              {submitting ? "Signing in…" : "Sign In"}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-500">
            Not an admin?{" "}
            <Link to="/" className="font-semibold text-amber-700 hover:text-amber-800">
              Go to VakeelSetu
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
