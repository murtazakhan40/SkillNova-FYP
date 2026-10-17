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
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-700">
          <Link
            href="/"
            className="py-1 flex items-center gap-1.5 transition-colors duration-200 hover:text-[#0B1B3D] relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-[#FF6B00] after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300 after:origin-left"
          >
            <span>Home</span>
          </Link>
          <Link
            href="/courses"
            className="py-1 flex items-center gap-1.5 transition-colors duration-200 hover:text-[#0B1B3D] relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-[#FF6B00] after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300 after:origin-left"
          >
            <BookOpen className="w-4 h-4 text-slate-400 group-hover:text-[#FF6B00]" />
            <span>Explore Courses</span>
          </Link>
          <Link
            href="/about"
            className="py-1 flex items-center gap-1.5 transition-colors duration-200 hover:text-[#0B1B3D] relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-[#FF6B00] after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300 after:origin-left"
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
                className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-[#0B1B3D] text-white hover:bg-[#132752] btn-lift shadow-sm border border-slate-700/50"
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
                <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-[#0B1B3D] font-bold border border-slate-200 text-sm overflow-hidden shadow-sm">
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
                    className="p-2 text-slate-400 hover:text-red-600 transition-colors rounded-lg hover:bg-slate-100 cursor-pointer"
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
                className="text-sm font-bold text-slate-700 hover:text-[#0B1B3D] px-3.5 py-2 rounded-xl hover:bg-slate-100 transition-all"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 text-sm font-bold bg-gradient-to-r from-[#FF6B00] to-[#EA580C] text-white px-5 py-2.5 rounded-xl shadow-md shadow-orange-500/25 btn-lift group"
              >
                <Sparkles className="w-4 h-4 transition-transform group-hover:rotate-12" />
                <span>Enroll Free</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
