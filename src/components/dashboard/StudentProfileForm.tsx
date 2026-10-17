"use client";

import React, { useActionState } from "react";
import { 
  updateStudentProfileAction, 
  ProfileUpdateResult 
} from "@/app/actions/profile";
import { 
  User, 
  Mail, 
  Phone, 
  Briefcase, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Save, 
  ShieldCheck 
} from "lucide-react";

interface StudentProfileFormProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar?: string | null;
    headline?: string | null;
    bio?: string | null;
    phone?: string | null;
  };
}

export function StudentProfileForm({ user }: StudentProfileFormProps) {
  const [state, formAction, isPending] = useActionState<ProfileUpdateResult | null, FormData>(
    updateStudentProfileAction,
    null
  );

  return (
    <form action={formAction} className="space-y-6">
      {/* Feedback Messages */}
      {state?.success && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-start gap-3 animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold">Success: </span>
            {state.message}
          </div>
        </div>
      )}

      {state?.error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 flex items-start gap-3 animate-in fade-in duration-200">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold">Error: </span>
            {state.error}
          </div>
        </div>
      )}

      {/* Profile Overview Card */}
      <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center gap-5">
        <div className="w-16 h-16 rounded-full bg-[#0B1B3D] text-white flex items-center justify-center font-black text-xl overflow-hidden ring-4 ring-orange-500/20 shrink-0">
          {user.avatar ? (
            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
          ) : (
            user.name.charAt(0)
          )}
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-extrabold text-[#0B1B3D]">{user.name}</h3>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
              <ShieldCheck className="w-3 h-3 text-blue-600" />
              <span>Verified Student</span>
            </span>
          </div>
          <p className="text-xs text-slate-500">
            {user.headline || "Enrolled SkillNova Scholar"}
          </p>
          <div className="text-[11px] text-slate-400">
            Institutional Account ID: <span className="font-mono text-slate-600">{user.id}</span>
          </div>
        </div>
      </div>

      {/* Form Fields Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Full Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[#0B1B3D] flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <span>Full Name</span>
          </label>
          <input
            type="text"
            name="name"
            defaultValue={user.name}
            required
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00] transition-colors"
          />
        </div>

        {/* Email Address (Readonly) */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[#0B1B3D] flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-slate-400" />
            <span>Academic Email (Institutional SSO)</span>
          </label>
          <input
            type="email"
            value={user.email}
            disabled
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-xs text-slate-500 cursor-not-allowed"
          />
          <p className="text-[10px] text-slate-400">
            Email is tied to your institutional record and cannot be altered directly.
          </p>
        </div>

        {/* Headline */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[#0B1B3D] flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5 text-slate-400" />
            <span>Professional Headline</span>
          </label>
          <input
            type="text"
            name="headline"
            defaultValue={user.headline || ""}
            placeholder="e.g. BS Computer Science Undergraduate | Web Architect"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00] transition-colors"
          />
        </div>

        {/* Phone */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[#0B1B3D] flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-slate-400" />
            <span>Contact Phone Number</span>
          </label>
          <input
            type="text"
            name="phone"
            defaultValue={user.phone || ""}
            placeholder="e.g. 03029983146"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00] transition-colors"
          />
        </div>

        {/* Bio */}
        <div className="sm:col-span-2 space-y-1.5">
          <label className="text-xs font-bold text-[#0B1B3D] flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            <span>Academic Biography & Career Aspirations</span>
          </label>
          <textarea
            name="bio"
            rows={4}
            defaultValue={user.bio || ""}
            placeholder="Briefly describe your programming background, project goals, and engineering specialties..."
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00] transition-colors"
          />
          <p className="text-[10px] text-slate-400">
            Maximum 500 characters. Displays on your verifiable certificate recipient profiles.
          </p>
        </div>
      </div>

      {/* Save Button */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-[#FF6B00] hover:bg-[#EA580C] text-white shadow-md shadow-orange-500/20 disabled:opacity-50 transition-all"
        >
          <Save className="w-4 h-4" />
          <span>{isPending ? "Saving Profile..." : "Save Profile Information"}</span>
        </button>
      </div>
    </form>
  );
}
