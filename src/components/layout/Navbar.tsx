import React from "react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { SkillNovaLogo } from "@/components/brand/SkillNovaLogo";
import { 
  BookOpen, 
  Sparkles, 
  LogOut,
  LayoutDashboard
} from "lucide-react";
import { logoutAction } from "@/app/actions/auth";

export async function Navbar() {
  const user = await getCurrentUser();

  const getDashboardLink = () => {
    if (!user) return "/login";
    if (user.role === "ADMIN") return "/dashboard/admin";
    if (user.role === "TRAINER") return "/dashboard/trainer";
    return "/dashboard/student";
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex-shrink-0">
          <SkillNovaLogo size="md" />
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-700">
          <Link
            href="/"
            className="hover:text-[#FF6B00] transition-colors py-1 flex items-center gap-1.5"
          >
            <span>Home</span>
          </Link>
          <Link
            href="/courses"
            className="hover:text-[#FF6B00] transition-colors py-1 flex items-center gap-1.5"
          >
            <BookOpen className="w-4 h-4 text-slate-400" />
            <span>Explore Courses</span>
          </Link>
          <Link
            href="/about"
            className="hover:text-[#FF6B00] transition-colors py-1 flex items-center gap-1.5"
          >
            <span>About Academy</span>
          </Link>
        </nav>

        {/* Right CTA / User Status */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <Link
                href={getDashboardLink()}
                className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-[#0B1B3D] text-white hover:bg-[#132752] transition-all shadow-sm"
              >
                <LayoutDashboard className="w-4 h-4 text-[#FF6B00]" />
                <span>
                  {user.role === "ADMIN"
                    ? "Admin Console"
                    : user.role === "TRAINER"
                    ? "Trainer Studio"
                    : "Student Portal"}
                </span>
              </Link>

              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-[#0B1B3D] font-bold border border-slate-200 text-sm overflow-hidden">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    user.name.charAt(0)
                  )}
                </div>

                <form action={logoutAction} className="inline">
                  <button
                    type="submit"
                    title="Sign Out"
                    className="p-2 text-slate-400 hover:text-red-600 transition-colors rounded-lg hover:bg-slate-100"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-sm font-semibold text-slate-700 hover:text-[#0B1B3D] px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 text-sm font-semibold bg-[#FF6B00] hover:bg-[#EA580C] text-white px-4 py-2.5 rounded-xl shadow-md shadow-orange-500/20 transition-all hover:shadow-orange-500/30 hover:scale-[1.02]"
              >
                <Sparkles className="w-4 h-4" />
                <span>Enroll Free</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
