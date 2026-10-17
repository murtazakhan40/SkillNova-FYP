import React from "react";
import Link from "next/link";
import { SkillNovaLogo } from "@/components/brand/SkillNovaLogo";
import { GraduationCap, Mail, Phone, MapPin, Shield, Award, Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#0B1B3D] text-slate-300 border-t border-slate-800">
      {/* Top Banner Feature Strip */}
      <div className="border-b border-slate-800/80 bg-[#060E1E]/60 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-[#FF6B00]">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">Industry-Aligned Syllabi</h4>
              <p className="text-xs text-slate-400">Curated with leading software engineering firms.</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">Verified Credentials</h4>
              <p className="text-xs text-slate-400">Digital completion certificates with online verification.</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">BS CS Final Year Standard</h4>
              <p className="text-xs text-slate-400">Engineered with high academic rigor and clean design.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
        {/* Brand Bio */}
        <div className="lg:col-span-2 space-y-4">
          <SkillNovaLogo variant="light" size="lg" />
          <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
            SkillNova Academy is a next-generation web-based learning management ecosystem
            designed to empower developers, computer science undergraduates, and tech professionals with cutting-edge technical skills.
          </p>
          <div className="flex items-center gap-3 pt-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#132752] text-[#FF6B00] border border-[#1B376F]">
              <Sparkles className="w-3.5 h-3.5" /> Final Year Project (FYP)
            </span>
            <span className="text-xs text-slate-400">BS Computer Science</span>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
            Platform
          </h3>
          <ul className="space-y-2.5 text-sm">
            <li>
              <Link href="/" className="hover:text-[#FF6B00] transition-colors">
                Home
              </Link>
            </li>
            <li>
              <Link href="/courses" className="hover:text-[#FF6B00] transition-colors">
                All Courses
              </Link>
            </li>
            <li>
              <Link href="/login" className="hover:text-[#FF6B00] transition-colors">
                Student Login
              </Link>
            </li>
            <li>
              <Link href="/register" className="hover:text-[#FF6B00] transition-colors">
                Create Account
              </Link>
            </li>
          </ul>
        </div>

        {/* Portals */}
        <div>
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
            Portals & RBAC
          </h3>
          <ul className="space-y-2.5 text-sm">
            <li>
              <Link href="/dashboard/student" className="hover:text-[#FF6B00] transition-colors">
                Student Dashboard
              </Link>
            </li>
            <li>
              <Link href="/dashboard/trainer" className="hover:text-[#FF6B00] transition-colors">
                Trainer Studio
              </Link>
            </li>
            <li>
              <Link href="/dashboard/admin" className="hover:text-[#FF6B00] transition-colors">
                Admin Console
              </Link>
            </li>
            <li>
              <Link href="/verify" className="hover:text-[#FF6B00] transition-colors">
                Verify Certificate
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact info */}
        <div>
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
            Academic & Contact
          </h3>
          <ul className="space-y-3 text-xs text-slate-400">
            <li className="flex items-center gap-2.5">
              <img
                src="/murtaza-wazir.jpg"
                alt="Murtaza Wazir"
                className="w-6 h-6 rounded-full object-cover border border-[#FF6B00] shadow-sm shrink-0"
              />
              <span className="font-semibold text-white">Murtaza Wazir (Lead Developer)</span>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#FF6B00] shrink-0" />
              <a href="mailto:murtazwazir.edu@gmail.com" className="hover:text-[#FF6B00] transition-colors">
                murtazwazir.edu@gmail.com
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#FF6B00] shrink-0" />
              <a href="tel:03029983146" className="hover:text-[#FF6B00] transition-colors">
                0302-9983146 (+92 302 9983146)
              </a>
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#FF6B00] shrink-0" />
              <span>Dept. of Computer Science & IT</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Copyright */}
      <div className="border-t border-slate-800 py-6 bg-[#060E1E]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 SkillNova Academy. All rights reserved. University Final Year Project.</p>
          <div className="flex items-center gap-6">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Academic Integrity Code</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
