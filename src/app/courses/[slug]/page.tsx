import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { 
  Star, 
  BookOpen, 
  Award, 
  CheckCircle2, 
  PlayCircle, 
  HelpCircle, 
  Lock,
  ArrowRight,
  Sparkles
} from "lucide-react";
import { formatPrice, formatDate } from "@/lib/utils";
import { enrollInCourseAction } from "@/app/actions/enrollment";
import { submitCourseReview } from "@/app/actions/learning";

interface CourseDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: CourseDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const course = await db.course.findUnique({
    where: { slug },
    select: {
      title: true,
      subtitle: true,
      description: true,
      thumbnail: true,
      category: { select: { name: true } },
      instructor: { select: { name: true } },
    },
  });

  if (!course) {
    return {
      title: "Course Not Found | SkillNova Academy",
    };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://skillnovaacademy.com";
  const desc = course.subtitle || course.description.slice(0, 160);

  return {
    title: `${course.title} | SkillNova Academy`,
    description: desc,
    alternates: {
      canonical: `${appUrl}/courses/${slug}`,
    },
    openGraph: {
      title: `${course.title} | ${course.category?.name || "SkillNova"}`,
      description: desc,
      url: `${appUrl}/courses/${slug}`,
      siteName: "SkillNova Academy",
      images: [
        {
          url: course.thumbnail || `${appUrl}/brand/banner.png`,
          width: 1200,
          height: 630,
          alt: course.title,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: course.title,
      description: desc,
      images: [course.thumbnail || `${appUrl}/brand/banner.png`],
    },
  };
}

export default async function CourseDetailPage({ params }: CourseDetailPageProps) {
  const { slug } = await params;
  const user = await getCurrentUser();

  const course = await db.course.findUnique({
    where: { slug },
    include: {
      category: true,
      instructor: true,
      sections: {
        orderBy: { order: "asc" },
        include: {
          lessons: {
            orderBy: { order: "asc" },
          },
        },
      },
      quizzes: {
        include: { questions: true },
      },
      reviews: {
        include: { user: true },
      },
    },
  });

  if (!course) {
    notFound();
  }

  // Check if current user is already enrolled
  let isEnrolled = false;
  if (user) {
    const enrollment = await db.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId: course.id,
        },
      },
    });
    isEnrolled = !!enrollment;
  }

  const totalLessons = course.sections.reduce(
    (acc, s) => acc + s.lessons.length,
    0
  );

  const avgRating =
    course.reviews.length > 0
      ? (
          course.reviews.reduce((acc, r) => acc + r.rating, 0) /
          course.reviews.length
        ).toFixed(1)
      : "5.0";

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://skillnovaacademy.com";

  // Course structured data matching exact visible page content
  const courseJsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.title,
    description: course.subtitle || course.description,
    url: `${appUrl}/courses/${course.slug}`,
    image: course.thumbnail || undefined,
    provider: {
      "@type": "EducationalOrganization",
      name: "SkillNova Academy",
      sameAs: appUrl,
    },
    instructor: {
      "@type": "Person",
      name: course.instructor.name,
      jobTitle: course.instructor.headline || "Course Instructor",
    },
    offers: {
      "@type": "Offer",
      price: course.price > 0 ? course.price : "0",
      priceCurrency: "PKR",
      category: course.price > 0 ? "Paid Course" : "Free Foundation Track",
    },
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "Online",
      courseWorkload: `${totalLessons} lessons`,
    },
    educationalCredentialAwarded: "SkillNova Verified Digital Certificate",
    ...(course.reviews.length > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: avgRating,
            reviewCount: course.reviews.length,
            bestRating: "5",
            worstRating: "1",
          },
        }
      : {}),
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseJsonLd) }}
      />
      <Navbar />

      {/* Top Breadcrumb & Hero */}
      <section className="bg-[#0B1B3D] text-white pt-10 pb-16 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-6">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/courses" className="hover:text-white transition-colors">
              Courses
            </Link>
            <span>/</span>
            <span className="text-[#FF6B00]">{course.category.name}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-[#FF6B00] text-white">
                  {course.category.name}
                </span>
                <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-[#132752] text-slate-200 border border-[#1B376F]">
                  {course.level} Level
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-extrabold tracking-tight leading-tight">
                {course.title}
              </h1>

              {course.subtitle && (
                <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
                  {course.subtitle}
                </p>
              )}

              {/* Course Meta Info */}
              <div className="flex flex-wrap items-center gap-6 pt-2 text-xs text-slate-300">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span>{avgRating}</span>
                  <span className="text-slate-400 font-normal">
                    ({course.reviews.length} reviews)
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-slate-400" />
                  <span>{totalLessons} Lessons</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-emerald-400" />
                  <span>Certificate Included</span>
                </div>

                <div className="flex items-center gap-2">
                  <img
                    src={course.instructor.avatar || "/murtaza-wazir.jpg"}
                    alt={course.instructor.name}
                    className="w-6 h-6 rounded-full object-cover border border-[#FF6B00] shadow-sm shrink-0"
                  />
                  <span>Instructor: </span>
                  <span className="font-semibold text-white">
                    {course.instructor.name}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content & Floating Sidebar */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Syllabus & Details */}
          <div className="lg:col-span-8 space-y-10">
            {/* What you'll learn */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-sm">
              <h2 className="text-xl font-bold text-[#0B1B3D] mb-4">
                What You Will Master in This Curriculum
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-700">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>End-to-end full-stack software architecture principles</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Relational database normalization & type-safe queries</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Role-Based Access Control and authentication security</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Production-grade deployment, testing, and CI/CD pipelines</span>
                </div>
              </div>
            </div>

            {/* Curriculum Breakdown */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-[#0B1B3D]">
                    Curriculum Content
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    {course.sections.length} Sections • {totalLessons} Lessons • Interactive Quizzes
                  </p>
                </div>
              </div>

              {/* Section Accordions */}
              <div className="space-y-4">
                {course.sections.map((section, sIndex) => (
                  <div
                    key={section.id}
                    className="border border-slate-200 rounded-xl overflow-hidden"
                  >
                    <div className="bg-slate-50 px-5 py-3.5 flex items-center justify-between border-b border-slate-200">
                      <div className="font-bold text-sm text-[#0B1B3D] flex items-center gap-2">
                        <span className="w-6 h-6 rounded-md bg-[#0B1B3D] text-white text-xs flex items-center justify-center font-bold">
                          {sIndex + 1}
                        </span>
                        <span>{section.title}</span>
                      </div>
                      <span className="text-xs text-slate-500 font-medium">
                        {section.lessons.length} lessons
                      </span>
                    </div>

                    <div className="divide-y divide-slate-100">
                      {section.lessons.map((lesson) => {
                        const canAccess = isEnrolled || lesson.isFree;
                        return (
                          <Link
                            key={lesson.id}
                            href={canAccess ? `/courses/${course.slug}/learn/${lesson.id}` : `/courses/${course.slug}`}
                            className="px-5 py-3.5 flex items-center justify-between text-xs hover:bg-slate-50 transition-colors group/item"
                          >
                            <div className="flex items-center gap-3">
                              {lesson.isFree ? (
                                <PlayCircle className="w-4 h-4 text-[#FF6B00]" />
                              ) : isEnrolled ? (
                                <PlayCircle className="w-4 h-4 text-emerald-600" />
                              ) : (
                                <Lock className="w-4 h-4 text-slate-400" />
                              )}
                              <span className="font-medium text-slate-700 group-hover/item:text-[#0B1B3D]">
                                {lesson.title}
                              </span>
                              {lesson.isFree && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-orange-100 text-[#FF6B00]">
                                  Free Preview
                                </span>
                              )}
                            </div>
                            <span className="text-slate-400 font-mono">
                              {lesson.duration}
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Assessment Section */}
              {course.quizzes.length > 0 && (
                <Link
                  href={`/courses/${course.slug}/quiz/${course.quizzes[0].id}`}
                  className="mt-6 p-4 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-between hover:bg-orange-100/70 transition-colors block"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#FF6B00] text-white flex items-center justify-center">
                      <HelpCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#0B1B3D]">
                        Assessment Quiz: {course.quizzes[0].title}
                      </h4>
                      <p className="text-[11px] text-slate-600">
                        {course.quizzes[0].questions.length} questions • Passing score {course.quizzes[0].passingScore}%
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#FF6B00]">
                    Take Quiz →
                  </span>
                </Link>
              )}
            </div>

            {/* Instructor Profile Card */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-sm">
              <h2 className="text-xl font-bold text-[#0B1B3D] mb-6">
                Your Instructor
              </h2>
              <div className="flex flex-col sm:flex-row items-start gap-5">
                <img
                  src={
                    course.instructor.avatar ||
                    "/murtaza-wazir.jpg"
                  }
                  alt={course.instructor.name}
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-[#FF6B00]/30 shadow-md shrink-0"
                />
                <div className="space-y-1.5 flex-1">
                  <h3 className="text-lg font-bold text-[#0B1B3D]">
                    {course.instructor.name}
                  </h3>
                  <p className="text-xs font-semibold text-[#FF6B00]">
                    {course.instructor.headline || "Senior Computer Science Faculty"}
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed pt-1">
                    {course.instructor.bio ||
                      "Dedicated educator with deep technical expertise in modern full-stack development, cloud microservices, and AI architectures."}
                  </p>
                </div>
              </div>
            </div>

            {/* Student Reviews */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-sm">
              <h2 className="text-xl font-bold text-[#0B1B3D] mb-4">
                Student Feedback & Ratings
              </h2>
              {course.reviews.length > 0 ? (
                <div className="space-y-4">
                  {course.reviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-[#0B1B3D] text-white flex items-center justify-center text-xs font-bold">
                            {rev.user.name.charAt(0)}
                          </div>
                          <span className="text-xs font-bold text-slate-800">
                            {rev.user.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-amber-500">
                          {Array.from({ length: rev.rating }).map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 italic">
                        &ldquo;{rev.comment}&rdquo;
                      </p>
                      <div className="text-[10px] text-slate-400">
                        Reviewed on {formatDate(rev.createdAt)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500">No student reviews yet.</p>
              )}

              {isEnrolled && (
                <form action={submitCourseReview} className="mt-6 pt-6 border-t border-slate-100 space-y-3">
                  <input type="hidden" name="courseId" value={course.id} />
                  <input type="hidden" name="courseSlug" value={course.slug} />
                  <h4 className="text-xs font-bold text-[#0B1B3D]">Leave Your Review & Rating</h4>
                  <div className="flex items-center gap-3">
                    <label className="text-xs text-slate-600 font-semibold">Rating:</label>
                    <select name="rating" defaultValue="5" className="px-2.5 py-1 rounded-lg border border-slate-300 text-xs">
                      <option value="5">⭐⭐⭐⭐⭐ (5 Stars - Excellent)</option>
                      <option value="4">⭐⭐⭐⭐ (4 Stars - Great)</option>
                      <option value="3">⭐⭐⭐ (3 Stars - Good)</option>
                      <option value="2">⭐⭐ (2 Stars - Fair)</option>
                      <option value="1">⭐ (1 Star - Poor)</option>
                    </select>
                  </div>
                  <textarea
                    name="comment"
                    required
                    rows={3}
                    placeholder="Share your experience with this course curriculum..."
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#FF6B00] focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-[#0B1B3D] text-white hover:bg-[#132752] transition-colors"
                  >
                    Submit Review to Database
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Right Column: Sticky Enrollment Box */}
          <div className="lg:col-span-4">
            <div className="sticky top-28 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
              {/* Thumbnail / Video Preview */}
              <div className="relative aspect-video bg-slate-900">
                <img
                  src={
                    course.thumbnail ||
                    "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800"
                  }
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-[#FF6B00] text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-pointer">
                    <PlayCircle className="w-6 h-6" />
                  </div>
                </div>
              </div>

              {/* Pricing & CTA */}
              <div className="p-6 space-y-5">
                <div className="flex items-baseline justify-between">
                  <span className="text-3xl font-heading font-extrabold text-[#0B1B3D]">
                    {course.price > 0 ? formatPrice(course.price) : "Free Access"}
                  </span>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-md border ${
                    course.price > 0
                      ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                      : "text-blue-700 bg-blue-50 border-blue-200"
                  }`}>
                    {course.price > 0 ? "Full Academic License" : "Free Foundation Track"}
                  </span>
                </div>

                {isEnrolled ? (
                  <Link
                    href={`/courses/${course.slug}/learn/${course.sections[0]?.lessons[0]?.id || ""}`}
                    className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-heading font-bold bg-[#0B1B3D] hover:bg-[#132752] text-white shadow-md btn-lift text-sm"
                  >
                    <span>Already Enrolled • Enter Classroom</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                ) : course.price <= 0 ? (
                  /* FREE COURSE PATH: Direct zero-dollar enrollment */
                  <form action={enrollInCourseAction.bind(null, course.id)}>
                    <button
                      type="submit"
                      className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-heading font-bold bg-gradient-to-r from-emerald-600 to-teal-700 hover:opacity-95 text-white shadow-lg shadow-emerald-500/25 btn-lift text-sm cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Enroll for Free • Start Learning</span>
                    </button>
                  </form>
                ) : (
                  /* PAID COURSE PATH: Routed through server-verified checkout */
                  <div className="space-y-2">
                    <Link
                      href={`/checkout/${course.slug}`}
                      className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-heading font-bold bg-gradient-to-r from-[#FF6B00] to-[#EA580C] text-white shadow-lg shadow-orange-500/25 btn-lift text-sm cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Proceed to Checkout</span>
                    </Link>

                    <div className="text-[11px] text-center text-slate-400">
                      Academic Demo Simulator • Zero real charges
                    </div>
                  </div>
                )}

                {/* Features included */}
                <div className="space-y-2.5 pt-4 border-t border-slate-100 text-xs text-slate-600">
                  <div className="font-bold text-[#0B1B3D] mb-1">
                    This enrollment includes:
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>{totalLessons} on-demand video & code lectures</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>Full curriculum interactive quizzes & assessments</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>Direct Q&A with {course.instructor.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>Official Verified Digital Certificate</span>
                  </div>

                  <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                    <img
                      src={course.instructor.avatar || "/murtaza-wazir.jpg"}
                      alt={course.instructor.name}
                      className="w-10 h-10 rounded-full object-cover border border-[#FF6B00]/40 shadow-sm shrink-0"
                    />
                    <div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Lead Instructor</div>
                      <div className="text-xs font-bold text-[#0B1B3D]">{course.instructor.name}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
