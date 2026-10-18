import React from "react";
import Link from "next/link";
import { Star, BookOpen, ArrowRight } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface CourseCardProps {
  course: {
    id: string;
    title: string;
    slug: string;
    subtitle?: string | null;
    price: number;
    level: string;
    thumbnail?: string | null;
    category?: { name: string } | null;
    instructor?: { name: string; avatar?: string | null } | null;
    sections?: { lessons: { id: string }[] }[];
    reviews?: { rating: number }[];
  };
}

export function CourseCard({ course }: CourseCardProps) {
  const lessonCount =
    course.sections?.reduce((acc, s) => acc + (s.lessons?.length || 0), 0) || 0;

  const avgRating = course.reviews && course.reviews.length > 0
    ? (course.reviews.reduce((acc, r) => acc + r.rating, 0) / course.reviews.length).toFixed(1)
    : "5.0";

  const reviewCount = course.reviews?.length || 1;

  const levelColor = {
    BEGINNER: "bg-emerald-50 text-emerald-700 border-emerald-200",
    INTERMEDIATE: "bg-blue-50 text-blue-700 border-blue-200",
    ADVANCED: "bg-purple-50 text-purple-700 border-purple-200",
  }[course.level] || "bg-slate-50 text-slate-700 border-slate-200";

  return (
    <div className="group flex flex-col bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-orange-500/30 card-hover-effect overflow-hidden">
      {/* Thumbnail */}
      <Link href={`/courses/${course.slug}`} className="relative block aspect-video overflow-hidden bg-slate-900">
        <img
          src={course.thumbnail || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800"}
          alt={course.title}
          loading="lazy"
          decoding="async"
          width={400}
          height={225}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#060E1E]/80 via-transparent to-transparent opacity-90 transition-opacity group-hover:opacity-75" />

        {/* Level Tag */}
        <div className="absolute top-3 left-3">
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border backdrop-blur-md shadow-sm uppercase tracking-wider ${levelColor}`}>
            {course.level}
          </span>
        </div>

        {/* Category Pill */}
        {course.category && (
          <div className="absolute top-3 right-3">
            <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-[#0B1B3D]/85 text-slate-100 backdrop-blur-md border border-slate-700/50 shadow-sm">
              {course.category.name}
            </span>
          </div>
        )}

        {/* Price tag badge */}
        <div className="absolute bottom-3 right-3">
          <span className="px-3 py-1 rounded-lg bg-gradient-to-r from-[#FF6B00] to-[#EA580C] text-white font-heading font-extrabold text-xs shadow-md tracking-tight">
            {formatPrice(course.price)}
          </span>
        </div>
      </Link>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Rating & Lessons */}
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2.5">
            <div className="flex items-center gap-1 text-amber-500 font-semibold">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="font-bold">{avgRating}</span>
              <span className="text-slate-400 font-normal">({reviewCount})</span>
            </div>
            {lessonCount > 0 && (
              <div className="flex items-center gap-1 text-slate-500 font-medium">
                <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                <span>{lessonCount} Lessons</span>
              </div>
            )}
          </div>

          {/* Title */}
          <Link href={`/courses/${course.slug}`}>
            <h3 className="font-heading font-bold text-[15px] sm:text-base text-[#0B1B3D] group-hover:text-[#FF6B00] transition-colors duration-200 line-clamp-2 leading-snug mb-2">
              {course.title}
            </h3>
          </Link>

          {/* Subtitle */}
          {course.subtitle && (
            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
              {course.subtitle}
            </p>
          )}
        </div>

        {/* Footer info & CTA */}
        <div className="pt-4 mt-auto border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {course.instructor?.avatar ? (
              <img
                src={course.instructor.avatar}
                alt={course.instructor.name}
                loading="lazy"
                decoding="async"
                width={28}
                height={28}
                className="w-7 h-7 rounded-full object-cover border border-slate-200 shadow-sm"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-[#0B1B3D] flex items-center justify-center text-xs text-white font-bold">
                {course.instructor?.name?.charAt(0) || "T"}
              </div>
            )}
            <span className="text-xs font-semibold text-slate-600 line-clamp-1">
              {course.instructor?.name || "SkillNova Faculty"}
            </span>
          </div>

          <Link
            href={`/courses/${course.slug}`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF6B00] hover:text-[#EA580C] group/btn transition-colors"
          >
            <span>Details</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover/btn:translate-x-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}
