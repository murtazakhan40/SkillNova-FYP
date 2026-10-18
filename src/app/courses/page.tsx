import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CourseCard } from "@/components/course/CourseCard";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { Search, Filter, BookOpen, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Academic Course Catalog | SkillNova Academy",
  description:
    "Explore rigorous computer science, web development, cloud computing, and AI engineering courses with verified certification.",
  alternates: {
    canonical: "https://skillnovaacademy.com/courses",
  },
};

interface CoursesPageProps {
  searchParams: Promise<{
    category?: string;
    level?: string;
    q?: string;
    page?: string;
  }>;
}

const PAGE_SIZE = 12;

export default async function CoursesPage({ searchParams }: CoursesPageProps) {
  const params = await searchParams;
  const categorySlug = params.category;
  const levelParam = params.level;
  const searchQuery = params.q;
  const currentPage = Math.max(1, parseInt(params.page || "1", 10) || 1);

  // Build where conditions
  const where: Prisma.CourseWhereInput = { published: true };

  if (categorySlug) {
    where.category = { slug: categorySlug };
  }

  if (levelParam) {
    where.level = levelParam.toUpperCase();
  }

  if (searchQuery) {
    where.OR = [
      { title: { contains: searchQuery } },
      { description: { contains: searchQuery } },
      { subtitle: { contains: searchQuery } },
    ];
  }

  const [totalCount, courses, categories] = await Promise.all([
    db.course.count({ where }),
    db.course.findMany({
      where,
      select: {
        id: true,
        title: true,
        slug: true,
        subtitle: true,
        price: true,
        level: true,
        thumbnail: true,
        category: { select: { name: true, slug: true } },
        instructor: { select: { name: true, avatar: true } },
        sections: {
          select: { lessons: { select: { id: true } } },
        },
        reviews: { select: { rating: true } },
      },
      skip: (currentPage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      orderBy: { createdAt: "desc" },
    }),
    db.category.findMany({
      include: {
        _count: {
          select: { courses: true },
        },
      },
    }),
  ]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />

      {/* Header Banner */}
      <section className="bg-[#0B1B3D] text-white py-14 border-b border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-[#FF6B00]/10 blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#132752] border border-[#1B376F] text-[#FF8533] mb-4 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-[#FF6B00]" />
              <span>Academic Curriculum Catalog</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-heading font-extrabold tracking-tight">
              Explore All Courses
            </h1>
            <p className="text-sm sm:text-base text-slate-300 mt-3 font-normal leading-relaxed">
              Browse through rigorous software development, artificial intelligence, and cloud engineering tracks.
            </p>
          </div>
        </div>
      </section>

      {/* Main Catalog Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        {/* Filters and Search Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-8">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            <Link
              href="/courses"
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                !categorySlug
                  ? "bg-[#0B1B3D] text-white"
                  : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              All Topics
            </Link>

            {categories.map((cat) => {
              const isActive = categorySlug === cat.slug;
              return (
                <Link
                  key={cat.id}
                  href={`/courses?category=${cat.slug}${levelParam ? `&level=${levelParam}` : ""}`}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                    isActive
                      ? "bg-[#FF6B00] text-white shadow-sm"
                      : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  {cat.name} ({cat._count.courses})
                </Link>
              );
            })}
          </div>

          {/* Search Form */}
          <form method="GET" action="/courses" className="relative min-w-[280px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              name="q"
              defaultValue={searchQuery || ""}
              placeholder="Search topics or skills..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent"
            />
            {categorySlug && <input type="hidden" name="category" value={categorySlug} />}
            {levelParam && <input type="hidden" name="level" value={levelParam} />}
          </form>
        </div>

        {/* Level Filters bar */}
        <div className="flex items-center gap-3 mb-6 text-xs text-slate-600">
          <span className="font-semibold flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            Level:
          </span>
          {["All", "Beginner", "Intermediate", "Advanced"].map((lvl) => {
            const isAll = lvl === "All";
            const isMatch = isAll ? !levelParam : levelParam === lvl.toUpperCase();
            const href = isAll
              ? `/courses${categorySlug ? `?category=${categorySlug}` : ""}`
              : `/courses?level=${lvl.toUpperCase()}${categorySlug ? `&category=${categorySlug}` : ""}`;

            return (
              <Link
                key={lvl}
                href={href}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  isMatch
                    ? "bg-[#0B1B3D] text-white"
                    : "text-slate-600 hover:bg-slate-200/60"
                }`}
              >
                {lvl}
              </Link>
            );
          })}
        </div>

        {/* Courses Listing */}
        {courses.length > 0 ? (
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-6">
              <span>
                Showing {((currentPage - 1) * PAGE_SIZE) + 1}–{Math.min(currentPage * PAGE_SIZE, totalCount)} of {totalCount} curriculum module{totalCount > 1 ? "s" : ""}
              </span>
              {totalPages > 1 && (
                <span className="text-slate-400">
                  Page {currentPage} of {totalPages}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {courses.map((course, idx) => (
                <ScrollReveal key={course.id} delay={idx * 60} direction="up" distance={16}>
                  <CourseCard course={course} />
                </ScrollReveal>
              ))}
            </div>

            {/* Pagination Nav */}
            {totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-2">
                {currentPage > 1 ? (
                  <Link
                    href={`/courses?page=${currentPage - 1}${categorySlug ? `&category=${categorySlug}` : ""}${levelParam ? `&level=${levelParam}` : ""}${searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : ""}`}
                    className="inline-flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </Link>
                ) : (
                  <span className="inline-flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold border border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed">
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </span>
                )}

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }).map((_, i) => {
                    const pageNum = i + 1;
                    const isCurrent = pageNum === currentPage;
                    return (
                      <Link
                        key={pageNum}
                        href={`/courses?page=${pageNum}${categorySlug ? `&category=${categorySlug}` : ""}${levelParam ? `&level=${levelParam}` : ""}${searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : ""}`}
                        className={`w-9 h-9 rounded-xl text-xs font-bold flex items-center justify-center transition-colors ${
                          isCurrent
                            ? "bg-[#0B1B3D] text-white shadow-xs"
                            : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                        }`}
                      >
                        {pageNum}
                      </Link>
                    );
                  })}
                </div>

                {currentPage < totalPages ? (
                  <Link
                    href={`/courses?page=${currentPage + 1}${categorySlug ? `&category=${categorySlug}` : ""}${levelParam ? `&level=${levelParam}` : ""}${searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : ""}`}
                    className="inline-flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <span className="inline-flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold border border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed">
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </span>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 p-8">
            <div className="w-14 h-14 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center mx-auto text-[#FF6B00] mb-4">
              <BookOpen className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-[#0B1B3D] mb-1">No Courses Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6">
              We couldn&apos;t find any courses matching your filter criteria. Try resetting the filters or searching with different keywords.
            </p>
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#0B1B3D] text-white hover:bg-[#132752] transition-colors"
            >
              Reset Filters
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
