import React from "react";
import Link from "next/link";
import { db } from "@/lib/db";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CourseCard } from "@/components/course/CourseCard";
import { HeroHeadline } from "@/components/animations/HeroHeadline";
import { HeroParticles } from "@/components/animations/HeroParticles";
import { CountUp } from "@/components/animations/CountUp";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { 
  Sparkles, 
  ArrowRight, 
  BookOpen, 
  Code, 
  Brain, 
  Cloud, 
  Palette, 
  ShieldCheck, 
  Award, 
  CheckCircle2, 
  GraduationCap,
  PlayCircle,
  Terminal,
  Zap,
  Check
} from "lucide-react";
import { quickDemoLogin } from "@/app/actions/auth";

export default async function HomePage() {
  // Fetch featured courses directly from Prisma
  const featuredCourses = await db.course.findMany({
    where: { published: true },
    include: {
      category: true,
      instructor: true,
      sections: {
        include: { lessons: true },
      },
      reviews: true,
    },
    take: 6,
    orderBy: { createdAt: "desc" },
  });

  const categories = await db.category.findMany({
    include: {
      _count: {
        select: { courses: true },
      },
    },
  });

  return (
    <div suppressHydrationWarning className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#0B1B3D] text-white pt-16 pb-24 lg:pt-24 lg:pb-32">
        {/* Ambient tech particle canvas */}
        <HeroParticles particleCount={32} />

        {/* Abstract background glowing shapes with subtle pulse */}
        <div className="absolute top-0 right-0 -mr-40 -mt-40 w-96 h-96 rounded-full bg-[#FF6B00]/15 blur-3xl pointer-events-none animate-pulse-glow" />
        <div
          className="absolute bottom-0 left-0 -ml-40 -mb-40 w-96 h-96 rounded-full bg-[#3B66B8]/20 blur-3xl pointer-events-none animate-pulse-glow"
          style={{ animationDelay: "2.5s" }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Hero Text */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold bg-[#132752]/90 border border-[#1B376F] text-[#FF8533] shadow-inner backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-[#FF6B00] animate-spin" style={{ animationDuration: "12s" }} />
                <span>BS Computer Science Final Year Project (FYP)</span>
              </div>

              {/* Animated Main Headline */}
              <HeroHeadline />

              {/* Description */}
              <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                A state-of-the-art Web-based Learning Management Platform engineered for modern computer science.
                Explore verified curricula, track lesson progress, solve dynamic quizzes, and earn verifiable certificates.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  href="/courses"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl font-heading font-bold text-white bg-gradient-to-r from-[#FF6B00] to-[#EA580C] shadow-lg shadow-orange-500/25 btn-lift group"
                >
                  <BookOpen className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
                  <span>Browse All Courses</span>
                  <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>

                <Link
                  href="/register"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-heading font-bold text-slate-200 bg-[#132752]/90 hover:bg-[#1B376F] border border-slate-700/80 btn-lift hover:text-white group"
                >
                  <span>Student Sign Up</span>
                  <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1 text-[#FF8533]" />
                </Link>
              </div>

              {/* Trust Indicators with Live Count-Up */}
              <div className="pt-6 grid grid-cols-3 gap-6 border-t border-slate-800/80 text-left">
                <div>
                  <div className="text-2xl sm:text-3xl font-heading font-extrabold text-white tracking-tight">
                    <CountUp end={100} suffix="%" duration={1.5} />
                  </div>
                  <div className="text-xs text-slate-400 font-medium mt-0.5">Full-Stack Next.js</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-heading font-extrabold text-[#FF6B00] tracking-tight">
                    <CountUp end={3} suffix=" Roles" duration={1.2} />
                  </div>
                  <div className="text-xs text-slate-400 font-medium mt-0.5">Student, Trainer, Admin</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-heading font-extrabold text-white tracking-tight">
                    <CountUp end={13} suffix="+" duration={1.5} />
                  </div>
                  <div className="text-xs text-slate-400 font-medium mt-0.5">Production Curricula</div>
                </div>
              </div>
            </div>

            {/* Right Hero Interactive Preview Graphic */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md lg:max-w-none animate-float-slow">
                {/* Decorative border container with glow */}
                <div className="rounded-2xl p-2 bg-gradient-to-b from-slate-700/60 to-slate-800/40 border border-slate-700 shadow-2xl backdrop-blur-xl">
                  {/* Mock Classroom Card */}
                  <div className="rounded-xl bg-[#060E1E] border border-slate-800 overflow-hidden text-left shadow-2xl">
                    {/* Header bar */}
                    <div className="px-4 py-3 bg-[#0B1B3D] border-b border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500/80" />
                        <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                        <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                        <span className="text-xs font-mono text-slate-400 ml-2">skillnova-classroom.tsx</span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Live Classroom
                      </span>
                    </div>

                    {/* Mock Content */}
                    <div className="p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-[#FF6B00]">
                            <Terminal className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="text-xs text-slate-400 font-medium">Active Module</div>
                            <div className="text-sm font-heading font-bold text-white">Full-Stack App Architecture</div>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-[#FF6B00]">68% Completed</span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                        <div className="bg-gradient-to-r from-[#FF6B00] to-amber-400 h-2.5 rounded-full transition-all duration-1000" style={{ width: "68%" }} />
                      </div>

                      {/* Feature Checklist inside Mock */}
                      <div className="space-y-2 pt-2 text-xs text-slate-300">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>Normalized SQLite & PostgreSQL Schema</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>Role-Based Access Control (RBAC)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>Automated Assessment & Instant Grading</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>Digital Verifiable Certificates (SN-2026-X89J21)</span>
                        </div>
                      </div>

                      {/* Video mockup snippet */}
                      <div className="pt-2">
                        <div className="rounded-lg bg-slate-900 border border-slate-800 p-3 flex items-center justify-between hover:border-slate-700 transition-colors">
                          <div className="flex items-center gap-2">
                            <PlayCircle className="w-5 h-5 text-[#FF6B00]" />
                            <span className="text-xs text-slate-200 font-medium">Lesson 1: Server Components Overview</span>
                          </div>
                          <span className="text-[11px] text-slate-400 font-mono">14:20</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Evaluator Quick Switcher Strip (Crucial for FYP Committee Demo!) */}
      <section className="bg-white border-b border-slate-200/90 py-4 shadow-sm relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B00] animate-ping" />
              <span className="uppercase tracking-wider text-[#0B1B3D] font-extrabold">FYP Demo Mode:</span>
              <span className="font-normal text-slate-500">Test platform roles with 1-click instant login:</span>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <form action={quickDemoLogin.bind(null, "STUDENT")}>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200/80 btn-lift flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Student Portal (Murtaza)</span>
                </button>
              </form>

              <form action={quickDemoLogin.bind(null, "TRAINER")}>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg text-xs font-bold bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200/80 btn-lift flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Trainer Studio</span>
                </button>
              </form>

              <form action={quickDemoLogin.bind(null, "ADMIN")}>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg text-xs font-bold bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200/80 btn-lift flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Admin Console</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Academic Categories Section */}
      <section className="py-20 bg-slate-50/70 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal direction="up" distance={20}>
            <div className="text-center max-w-3xl mx-auto mb-14">
              <h2 className="text-xs font-extrabold uppercase tracking-widest text-[#FF6B00] mb-2 font-heading">
                Structured Learning Tracks
              </h2>
              <p className="text-3xl sm:text-4xl font-heading font-extrabold text-[#0B1B3D] tracking-tight">
                Explore Cutting-Edge Academic Disciplines
              </p>
              <p className="text-sm sm:text-base text-slate-600 mt-3 font-normal leading-relaxed">
                Curated modules engineered to prepare computer science students for modern industry standards.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat, idx) => {
              const iconMap: Record<string, React.ReactNode> = {
                "web-software-engineering": <Code className="w-6 h-6 text-[#FF6B00]" />,
                "artificial-intelligence-data": <Brain className="w-6 h-6 text-purple-600" />,
                "cloud-devops-architecture": <Cloud className="w-6 h-6 text-blue-600" />,
                "cybersecurity-system-defense": <ShieldCheck className="w-6 h-6 text-red-500" />,
                "algorithms-computer-science": <Terminal className="w-6 h-6 text-indigo-600" />,
                "ui-ux-product-design": <Palette className="w-6 h-6 text-emerald-600" />,
              };

              return (
                <ScrollReveal key={cat.id} delay={idx * 60} direction="up" distance={16}>
                  <Link
                    href={`/courses?category=${cat.slug}`}
                    className="group p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-orange-500/30 card-hover-effect flex flex-col justify-between h-full"
                  >
                    <div>
                      <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-orange-50 transition-all duration-300">
                        {iconMap[cat.slug] || <BookOpen className="w-6 h-6 text-[#FF6B00]" />}
                      </div>
                      <h3 className="font-heading font-bold text-base text-[#0B1B3D] group-hover:text-[#FF6B00] transition-colors mb-2">
                        {cat.name}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-normal">
                        {cat.description}
                      </p>
                    </div>
                    <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500">
                      <span>{cat._count.courses} Courses</span>
                      <span className="text-[#FF6B00] font-bold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                        Explore <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </Link>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Courses Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal direction="up" distance={16}>
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
              <div>
                <h2 className="text-xs font-extrabold uppercase tracking-widest text-[#FF6B00] mb-2 font-heading">
                  Featured Curricula
                </h2>
                <p className="text-3xl sm:text-4xl font-heading font-extrabold text-[#0B1B3D] tracking-tight">
                  Recommended Courses for You
                </p>
              </div>
              <Link
                href="/courses"
                className="inline-flex items-center gap-1.5 text-sm font-heading font-bold text-[#FF6B00] hover:text-[#EA580C] group transition-colors"
              >
                <span>View All Courses</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredCourses.map((course, idx) => (
              <ScrollReveal key={course.id} delay={idx * 80} direction="up" distance={20}>
                <CourseCard course={course} />
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Features / FYP Architectural Pillars */}
      <section className="py-20 bg-[#0B1B3D] text-white relative overflow-hidden">
        {/* Soft background radial accents */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-80 h-80 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-80 h-80 rounded-full bg-[#FF6B00]/10 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <ScrollReveal direction="up" distance={16}>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#FF6B00] font-heading">
                Built For Academic Rigor
              </span>
              <h2 className="text-3xl sm:text-4xl font-heading font-extrabold mt-2 tracking-tight">
                Why SkillNova Academy Stands Out
              </h2>
              <p className="text-sm sm:text-base text-slate-300 mt-3 font-normal leading-relaxed">
                Engineered using the best practices in modern software engineering, web security, and database normalization.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ScrollReveal delay={0} direction="up" distance={20}>
              <div className="p-8 rounded-2xl bg-[#132752]/90 border border-[#1B376F] space-y-4 card-hover-effect h-full">
                <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-[#FF6B00] shadow-inner">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="font-heading font-bold text-lg text-white">Three-Tier RBAC Architecture</h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                  Distinct portals for Students, Trainers, and System Administrators with server-side session authentication and protected middleware routing.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={120} direction="up" distance={20}>
              <div className="p-8 rounded-2xl bg-[#132752]/90 border border-[#1B376F] space-y-4 card-hover-effect h-full">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shadow-inner">
                  <Brain className="w-6 h-6" />
                </div>
                <h3 className="font-heading font-bold text-lg text-white">Dynamic Quiz & Grading Engine</h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                  Interactive multiple-choice assessments with immediate scoring, passing thresholds, review answers, and grade persistence in the relational DB.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={240} direction="up" distance={20}>
              <div className="p-8 rounded-2xl bg-[#132752]/90 border border-[#1B376F] space-y-4 card-hover-effect h-full">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-inner">
                  <Award className="w-6 h-6" />
                </div>
                <h3 className="font-heading font-bold text-lg text-white">Verifiable Digital Certificates</h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                  Automatic generation of unique certificate codes (e.g., SN-2026-X89J21) upon completion of course materials and required quiz benchmarks.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white border-t border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal direction="up" distance={20}>
            <div className="rounded-3xl bg-gradient-to-r from-[#0B1B3D] via-[#132752] to-[#0B1B3D] text-white p-10 sm:p-14 text-center relative overflow-hidden shadow-2xl border border-slate-700/50">
              {/* Background shimmer */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-500/15 via-transparent to-transparent pointer-events-none" />

              <div className="relative z-10 max-w-2xl mx-auto space-y-6">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FF6B00]/20 text-[#FFA566] border border-[#FF6B00]/30">
                  <Sparkles className="w-3.5 h-3.5" /> Start Learning Today
                </div>
                <h2 className="text-3xl sm:text-4xl font-heading font-extrabold tracking-tight">
                  Ready to Experience SkillNova Academy?
                </h2>
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
                  Join our university learning community today. Create a free account or explore our interactive demo portals.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                  <Link
                    href="/register"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-heading font-bold bg-gradient-to-r from-[#FF6B00] to-[#EA580C] text-white shadow-lg shadow-orange-500/30 btn-lift group"
                  >
                    <span>Create Student Account</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                  <Link
                    href="/courses"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-heading font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 btn-lift"
                  >
                    <span>Explore Catalog</span>
                  </Link>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <Footer />
    </div>
  );
}
