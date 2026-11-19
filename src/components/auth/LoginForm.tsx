"use client";

import React, { useState, useTransition, useId } from "react";
import { useSearchParams } from "next/navigation";
import { loginAction, requestPasswordResetAction } from "@/app/actions/auth";
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  ShieldCheck,
  KeyRound,
  X
} from "lucide-react";

interface LoginFormProps {
  initialRedirect?: string;
}

export function LoginForm({ initialRedirect }: LoginFormProps) {
  const searchParams = useSearchParams();
  const redirectParam = initialRedirect || searchParams.get("redirect") || "";

  const [isPending, startTransition] = useTransition();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [capsLockActive, setCapsLockActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Forgot Password Modal State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetPending, setResetPending] = useState(false);
  const [resetResult, setResetResult] = useState<{ success?: boolean; message?: string; demoToken?: string } | null>(null);

  const emailInputId = useId();
  const passwordInputId = useId();

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.getModifierState && typeof e.getModifierState === "function") {
      setCapsLockActive(e.getModifierState("CapsLock"));
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);
    if (redirectParam) {
      formData.append("redirectTo", redirectParam);
    }
    if (rememberMe) {
      formData.append("rememberMe", "true");
    }

    startTransition(async () => {
      try {
        const response = await loginAction(null, formData);
        if (response?.error) {
          setErrorMessage(response.error);
        }
      } catch (err: unknown) {
        // Next.js redirect throws a digest error which should be permitted to navigate
        const errMessage = err instanceof Error ? err.message : "";
        if (errMessage.includes("NEXT_REDIRECT")) {
          return;
        }
        setErrorMessage("An unexpected network or authentication error occurred. Please try again.");
      }
    });
  };

  const handlePasswordResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return;

    setResetPending(true);
    setResetResult(null);

    try {
      const formData = new FormData();
      formData.append("email", resetEmail);
      const res = await requestPasswordResetAction(null, formData);
      setResetResult(res);
    } catch {
      setResetResult({ success: false, message: "Unable to process password reset request at this time." });
    } finally {
      setResetPending(false);
    }
  };

  return (
    <div>
      {/* Error Alert Banner */}
      {errorMessage && (
        <div 
          role="alert" 
          aria-live="assertive" 
          className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-800 animate-in fade-in slide-in-from-top-1 duration-200"
        >
          <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
          <div className="flex-1 text-xs font-medium leading-relaxed">
            {errorMessage}
          </div>
          <button 
            type="button" 
            onClick={() => setErrorMessage(null)} 
            className="text-red-400 hover:text-red-600 cursor-pointer p-0.5 rounded transition-colors"
            aria-label="Dismiss error notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Authentication Form */}
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {redirectParam && (
          <input type="hidden" name="redirectTo" value={redirectParam} />
        )}

        {/* Email Field */}
        <div>
          <label 
            htmlFor={emailInputId} 
            className="block text-xs font-heading font-bold text-slate-700 mb-1.5"
          >
            Institutional / Personal Email
          </label>
          <div className="relative">
            <Mail 
              className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" 
              aria-hidden="true"
            />
            <input
              id={emailInputId}
              type="email"
              name="email"
              required
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. murtazwazir.edu@gmail.com"
              disabled={isPending}
              aria-invalid={!!errorMessage}
              className="w-full pl-9 pr-3 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent transition-all disabled:opacity-60 disabled:cursor-not-allowed bg-white"
            />
          </div>
        </div>

        {/* Password Field with Visibility Toggle & Caps Lock Warning */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label 
              htmlFor={passwordInputId} 
              className="block text-xs font-heading font-bold text-slate-700"
            >
              Account Password
            </label>
            <button
              type="button"
              onClick={() => {
                setResetEmail(email);
                setShowForgotModal(true);
              }}
              className="text-[11px] font-semibold text-[#FF6B00] hover:text-[#EA580C] hover:underline cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#FF6B00] rounded px-1 transition-colors"
            >
              Forgot password?
            </button>
          </div>

          <div className="relative">
            <Lock 
              className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" 
              aria-hidden="true" 
            />
            <input
              id={passwordInputId}
              type={showPassword ? "text" : "password"}
              name="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              onKeyUp={handleKeyDown}
              placeholder="••••••••••••"
              disabled={isPending}
              aria-invalid={!!errorMessage}
              className="w-full pl-9 pr-10 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent transition-all disabled:opacity-60 disabled:cursor-not-allowed bg-white"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer p-1 rounded transition-colors"
              aria-label={showPassword ? "Hide password text" : "Show password text"}
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4 text-slate-500" />
              ) : (
                <Eye className="w-4 h-4 text-slate-500" />
              )}
            </button>
          </div>

          {/* Caps Lock Detection Warning */}
          {capsLockActive && (
            <div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-amber-700 font-semibold bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              <span>Caps Lock is currently ON</span>
            </div>
          )}
        </div>

        {/* Remember Me & Security Badge */}
        <div className="flex items-center justify-between text-xs pt-0.5">
          <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600 font-medium">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              disabled={isPending}
              className="w-3.5 h-3.5 rounded text-[#FF6B00] focus:ring-[#FF6B00] border-slate-300 cursor-pointer"
            />
            <span>Remember this device</span>
          </label>
          <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>256-Bit SSL Secured</span>
          </div>
        </div>

        {/* Submit Button with Loading Indicator */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-heading font-bold text-white bg-[#0B1B3D] hover:bg-[#132752] active:scale-[0.99] shadow-md btn-lift cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed transition-all mt-3"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-[#FF6B00]" />
              <span>Authenticating Credentials...</span>
            </>
          ) : (
            <>
              <span>Sign In to SkillNova</span>
              <ArrowRight className="w-4 h-4 text-[#FF6B00]" />
            </>
          )}
        </button>
      </form>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
          aria-labelledby="forgot-modal-title"
        >
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 relative">
            <button
              onClick={() => {
                setShowForgotModal(false);
                setResetResult(null);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-3 text-[#0B1B3D]">
              <div className="w-8 h-8 rounded-xl bg-orange-100 text-[#FF6B00] flex items-center justify-center">
                <KeyRound className="w-4 h-4" />
              </div>
              <h3 id="forgot-modal-title" className="text-sm font-heading font-bold text-[#0B1B3D]">
                Account Password Recovery
              </h3>
            </div>

            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Enter your registered SkillNova email address. A cryptographically signed token will be generated to safely reset your password.
            </p>

            {resetResult?.message && (
              <div className={`mb-4 p-3 rounded-xl text-xs flex items-start gap-2 ${
                resetResult.success ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-red-50 text-red-800 border border-red-200"
              }`}>
                {resetResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                )}
                <div className="space-y-1">
                  <p className="font-medium">{resetResult.message}</p>
                  {resetResult.demoToken && (
                    <div className="text-[10px] bg-white/80 p-1.5 rounded font-mono break-all text-slate-700 border border-emerald-300">
                      <strong>Demo Recovery Token:</strong> {resetResult.demoToken}
                    </div>
                  )}
                </div>
              </div>
            )}

            <form onSubmit={handlePasswordResetSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="student@skillnova.edu"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="flex-1 py-2 px-3 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resetPending}
                  className="flex-1 py-2 px-3 text-xs font-bold text-white bg-[#FF6B00] hover:bg-[#EA580C] rounded-xl flex items-center justify-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-60"
                >
                  {resetPending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <span>Send Reset Link</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
