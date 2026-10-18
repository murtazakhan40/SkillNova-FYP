"use client";

import React, { useState, useMemo, useTransition } from "react";
import Link from "next/link";
import {
  BookOpen,
  Users,
  CheckCircle2,
  Clock,
  Search,
  PlusCircle,
  Edit3,
  ExternalLink,
  FileCheck,
  HelpCircle,
  X,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Download,
  Sparkles,
  Video,
} from "lucide-react";
import {
  gradeAssignmentAction,
  createCourseAssignmentAction,
  createCourseQuizAction,
  createCourseLessonAction,
} from "@/app/actions/classroom";
import { formatPrice } from "@/lib/utils";

export interface TrainerCourseData {
  id: string;
  title: string;
  slug: string;
  subtitle: string | null;
  description: string;
  thumbnail: string | null;
  price: number;
  level: string;
  published: boolean;
  categoryId: string;
  categoryName: string;
  enrollmentsCount: number;
  completedLearnersCount: number;
  lessonsCount: number;
  quizzesCount: number;
  assignmentsCount: number;
  sections: Array<{
    id: string;
    title: string;
    lessons: Array<{ id: string; title: string }>;
  }>;
}

export interface PendingAssignmentItem {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentAvatar: string | null;
  assignmentId: string;
  assignmentTitle: string;
  courseTitle: string;
  courseSlug: string;
  maxScore: number;
  textContent: string | null;
  fileUrl: string | null;
  fileName: string | null;
  status: string;
  submittedAt: string;
}

export interface RecentSubmissionFeedItem {
  id: string;
  type: "ASSIGNMENT" | "QUIZ";
  studentName: string;
  studentEmail: string;
  studentAvatar: string | null;
  title: string;
  courseTitle: string;
  courseSlug: string;
  score: number | null;
  maxScore?: number;
  passed?: boolean;
  status?: string;
  createdAt: string;
  rawItem?: PendingAssignmentItem;
}

interface TrainerDashboardActionCenterProps {
  courses: TrainerCourseData[];
  pendingReviews: PendingAssignmentItem[];
  submissionsFeed: RecentSubmissionFeedItem[];
  categories: Array<{ id: string; name: string }>;
}

export function TrainerDashboardActionCenter({
  courses,
  pendingReviews,
  submissionsFeed,
  categories,
}: TrainerDashboardActionCenterProps) {
  // Course search & category filter
  const [courseSearch, setCourseSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  // Submissions search & filter & pagination
  const [submissionSearch, setSubmissionSearch] = useState("");
  const [submissionFilter, setSubmissionFilter] = useState<
    "ALL" | "PENDING" | "GRADED" | "QUIZ_PASS" | "QUIZ_FAIL"
  >("ALL");
  const [subPage, setSubPage] = useState(1);
  const subsPerPage = 6;

  // Active Modals
  const [gradingModalItem, setGradingModalItem] = useState<PendingAssignmentItem | null>(null);
  const [gradeScore, setGradeScore] = useState<number>(85);
  const [gradeStatus, setGradeStatus] = useState<string>("GRADED");
  const [gradeFeedback, setGradeFeedback] = useState<string>("");
  const [gradingError, setGradingError] = useState<string | null>(null);

  // Create Assignment Modal
  const [showCreateAssignment, setShowCreateAssignment] = useState(false);
  const [assignCourseId, setAssignCourseId] = useState<string>(courses[0]?.id || "");
  const [assignTitle, setAssignTitle] = useState("");
  const [assignDesc, setAssignDesc] = useState("");
  const [assignDueDate, setAssignDueDate] = useState("");
  const [assignMaxScore, setAssignMaxScore] = useState(100);
  const [assignmentError, setAssignmentError] = useState<string | null>(null);

  // Create Quiz Modal
  const [showCreateQuiz, setShowCreateQuiz] = useState(false);
  const [quizCourseId, setQuizCourseId] = useState<string>(courses[0]?.id || "");
  const [quizTitle, setQuizTitle] = useState("");
  const [quizPassingScore, setQuizPassingScore] = useState(70);
  const [quizQuestions, setQuizQuestions] = useState<
    Array<{
      text: string;
      options: [string, string, string, string];
      correctIndex: number;
      explanation: string;
    }>
  >([
    {
      text: "",
      options: ["", "", "", ""],
      correctIndex: 0,
      explanation: "",
    },
  ]);
  const [quizError, setQuizError] = useState<string | null>(null);

  // Create Lesson Modal
  const [showCreateLesson, setShowCreateLesson] = useState(false);
  const [lessonCourseId, setLessonCourseId] = useState<string>(courses[0]?.id || "");
  const [lessonSectionId, setLessonSectionId] = useState<string>("");
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonDuration, setLessonDuration] = useState("12 mins");
  const [lessonVideoUrl, setLessonVideoUrl] = useState("");
  const [lessonContent, setLessonContent] = useState("");
  const [lessonIsFree, setLessonIsFree] = useState(false);
  const [lessonError, setLessonError] = useState<string | null>(null);

  // Action Success Toast State
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Transitions
  const [isPending, startTransition] = useTransition();

  const showNotification = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 4500);
  };

  // Filtered Courses
  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      if (courseSearch.trim()) {
        const q = courseSearch.toLowerCase();
        if (!c.title.toLowerCase().includes(q) && !c.description.toLowerCase().includes(q)) {
          return false;
        }
      }
      if (selectedCategory !== "ALL" && c.categoryId !== selectedCategory) {
        return false;
      }
      return true;
    });
  }, [courses, courseSearch, selectedCategory]);

  // Filtered Submissions
  const filteredSubmissions = useMemo(() => {
    return submissionsFeed.filter((s) => {
      if (submissionSearch.trim()) {
        const q = submissionSearch.toLowerCase();
        const matchName = s.studentName.toLowerCase().includes(q);
        const matchTitle = s.title.toLowerCase().includes(q);
        const matchCourse = s.courseTitle.toLowerCase().includes(q);
        if (!matchName && !matchTitle && !matchCourse) return false;
      }

      if (submissionFilter === "PENDING") {
        if (s.type !== "ASSIGNMENT" || s.status !== "SUBMITTED") return false;
      } else if (submissionFilter === "GRADED") {
        if (s.type !== "ASSIGNMENT" || s.status !== "GRADED") return false;
      } else if (submissionFilter === "QUIZ_PASS") {
        if (s.type !== "QUIZ" || !s.passed) return false;
      } else if (submissionFilter === "QUIZ_FAIL") {
        if (s.type !== "QUIZ" || s.passed) return false;
      }

      return true;
    });
  }, [submissionsFeed, submissionSearch, submissionFilter]);

  // Paginated Submissions
  const totalPages = Math.max(1, Math.ceil(filteredSubmissions.length / subsPerPage));
  const paginatedSubmissions = useMemo(() => {
    const start = (subPage - 1) * subsPerPage;
    return filteredSubmissions.slice(start, start + subsPerPage);
  }, [filteredSubmissions, subPage]);

  // Sections for chosen course in Lesson Modal
  const availableSections = useMemo(() => {
    const selectedCourse = courses.find((c) => c.id === lessonCourseId);
    return selectedCourse ? selectedCourse.sections : [];
  }, [courses, lessonCourseId]);

  // 1. Handle Submit Grade
  const handleSaveGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradingModalItem) return;

    setGradingError(null);
    const formData = new FormData();
    formData.set("submissionId", gradingModalItem.id);
    formData.set("score", gradeScore.toString());
    formData.set("status", gradeStatus);
    formData.set("feedback", gradeFeedback.trim());

    startTransition(async () => {
      try {
        await gradeAssignmentAction(formData);
        setGradingModalItem(null);
        showNotification(`Evaluation successfully recorded for ${gradingModalItem.studentName}.`);
      } catch (err: unknown) {
        setGradingError(err instanceof Error ? err.message : "Failed to record evaluation.");
      }
    });
  };

  // 2. Handle Create Assignment
  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    setAssignmentError(null);

    const formData = new FormData();
    formData.set("courseId", assignCourseId);
    formData.set("title", assignTitle);
    formData.set("description", assignDesc);
    formData.set("dueDate", assignDueDate);
    formData.set("maxScore", assignMaxScore.toString());

    startTransition(async () => {
      try {
        await createCourseAssignmentAction(formData);
        setShowCreateAssignment(false);
        setAssignTitle("");
        setAssignDesc("");
        setAssignDueDate("");
        showNotification("Assignment successfully created and published to course syllabus.");
      } catch (err: unknown) {
        setAssignmentError(err instanceof Error ? err.message : "Failed to create assignment.");
      }
    });
  };

  // 3. Handle Create Quiz
  const handleCreateQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    setQuizError(null);

    // Validation
    for (let i = 0; i < quizQuestions.length; i++) {
      const q = quizQuestions[i];
      if (!q.text.trim()) {
        setQuizError(`Question #${i + 1} requires a question prompt.`);
        return;
      }
      if (q.options.some((opt) => !opt.trim())) {
        setQuizError(`Question #${i + 1} must have all 4 option choices filled.`);
        return;
      }
    }

    const formData = new FormData();
    formData.set("courseId", quizCourseId);
    formData.set("title", quizTitle);
    formData.set("passingScore", quizPassingScore.toString());
    formData.set("questions", JSON.stringify(quizQuestions));

    startTransition(async () => {
      try {
        await createCourseQuizAction(formData);
        setShowCreateQuiz(false);
        setQuizTitle("");
        setQuizQuestions([
          {
            text: "",
            options: ["", "", "", ""],
            correctIndex: 0,
            explanation: "",
          },
        ]);
        showNotification("Assessment Quiz and questions successfully published.");
      } catch (err: unknown) {
        setQuizError(err instanceof Error ? err.message : "Failed to create quiz.");
      }
    });
  };

  // 4. Handle Create Lesson
  const handleCreateLesson = (e: React.FormEvent) => {
    e.preventDefault();
    setLessonError(null);

    if (!lessonSectionId) {
      setLessonError("Please select a target curriculum section.");
      return;
    }

    const formData = new FormData();
    formData.set("sectionId", lessonSectionId);
    formData.set("title", lessonTitle);
    formData.set("duration", lessonDuration);
    formData.set("videoUrl", lessonVideoUrl);
    formData.set("content", lessonContent);
    formData.set("isFree", lessonIsFree ? "true" : "false");

    startTransition(async () => {
      try {
        await createCourseLessonAction(formData);
        setShowCreateLesson(false);
        setLessonTitle("");
        setLessonVideoUrl("");
        setLessonContent("");
        showNotification("Lesson successfully added to curriculum module.");
      } catch (err: unknown) {
        setLessonError(err instanceof Error ? err.message : "Failed to create lesson.");
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* Success Notification Banner */}
      {successToast && (
        <div
          role="status"
          aria-live="polite"
          className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between shadow-xs animate-in fade-in slide-in-from-top-2"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessToast(null)}
            className="p-1 rounded-md text-emerald-600 hover:bg-emerald-100"
            aria-label="Dismiss message"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* QUICK FACULTY ACTION BAR */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-extrabold text-[#0B1B3D] uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#FF6B00]" />
            <span>Curriculum Studio Actions:</span>
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              if (courses.length > 0) {
                setAssignCourseId(courses[0].id);
                setShowCreateAssignment(true);
              }
            }}
            disabled={courses.length === 0}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-orange-50 hover:bg-orange-100 border border-orange-200 text-[#FF6B00] transition-colors disabled:opacity-40 cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Create Assignment</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (courses.length > 0) {
                setQuizCourseId(courses[0].id);
                setShowCreateQuiz(true);
              }
            }}
            disabled={courses.length === 0}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 transition-colors disabled:opacity-40 cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Create Quiz</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (courses.length > 0) {
                setLessonCourseId(courses[0].id);
                const firstSec = courses[0].sections[0]?.id || "";
                setLessonSectionId(firstSec);
                setShowCreateLesson(true);
              }
            }}
            disabled={courses.length === 0}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 transition-colors disabled:opacity-40 cursor-pointer"
          >
            <Video className="w-3.5 h-3.5" />
            <span>Add Lesson</span>
          </button>

          <Link
            href="/dashboard/trainer/new-course"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#FF6B00] hover:bg-[#EA580C] text-white shadow-xs transition-all hover:scale-102"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>New Course</span>
          </Link>
        </div>
      </div>

      {/* PENDING REVIEWS QUEUE (HIGHLIGHTED IF ITEMS EXIST) */}
      {pendingReviews.length > 0 && (
        <div className="bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-transparent rounded-2xl border border-orange-200 p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#FF6B00] text-white flex items-center justify-center font-bold">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-[#0B1B3D] flex items-center gap-2">
                  <span>Action Required: Deliverables Awaiting Your Grading</span>
                  <span className="px-2 py-0.5 rounded-full bg-[#FF6B00] text-white text-[10px] font-bold">
                    {pendingReviews.length} Pending
                  </span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Students have submitted projects for review. Grade and provide constructive feedback.
                </p>
              </div>
            </div>

            <Link
              href="/dashboard/trainer/assessments"
              className="text-xs font-bold text-[#FF6B00] hover:underline inline-flex items-center gap-1 shrink-0"
            >
              <span>View All Assessments</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {pendingReviews.map((sub) => (
              <div
                key={sub.id}
                className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between hover:border-orange-300 transition-colors"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 truncate max-w-[180px]">
                      {sub.courseTitle}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {sub.submittedAt}
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-[#0B1B3D] line-clamp-1">
                    {sub.assignmentTitle}
                  </h3>

                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-6 h-6 rounded-full bg-[#0B1B3D] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                      {sub.studentAvatar ? (
                        <img src={sub.studentAvatar} alt={sub.studentName} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        sub.studentName.charAt(0)
                      )}
                    </div>
                    <span className="font-semibold text-slate-700 truncate">
                      {sub.studentName}
                    </span>
                  </div>

                  {sub.textContent && (
                    <p className="text-[11px] text-slate-500 line-clamp-2 italic bg-slate-50 p-2 rounded-lg">
                      &ldquo;{sub.textContent}&rdquo;
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 mt-3 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400">
                    Max: {sub.maxScore} Pts
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      setGradingModalItem(sub);
                      setGradeScore(Math.round(sub.maxScore * 0.85));
                      setGradeStatus("GRADED");
                      setGradeFeedback("");
                      setGradingError(null);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#FF6B00] hover:bg-[#EA580C] text-white transition-all shadow-xs cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Grade & Feedback</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ASSIGNED TEACHING TRACKS */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div>
            <h2 className="text-base font-extrabold text-[#0B1B3D] flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#FF6B00]" />
              <span>Assigned Teaching Tracks ({courses.length})</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage syllabus structure, lessons, and project deliverables for your courses.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={courseSearch}
                onChange={(e) => setCourseSearch(e.target.value)}
                placeholder="Search tracks..."
                className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-[#FF6B00]"
                aria-label="Search courses"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-hidden"
              aria-label="Filter by category"
            >
              <option value="ALL">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((c) => (
              <div
                key={c.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
              >
                <div>
                  <div className="relative aspect-video w-full bg-slate-900 overflow-hidden">
                    {c.thumbnail ? (
                      <img
                        src={c.thumbnail}
                        alt={c.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#0B1B3D] to-[#1E3A8A] flex items-center justify-center">
                        <BookOpen className="w-10 h-10 text-white/30" />
                      </div>
                    )}

                    <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/95 text-[#0B1B3D]">
                        {c.categoryName}
                      </span>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-500 text-white shadow-xs">
                        Published
                      </span>
                    </div>

                    <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-white text-[10px] font-bold bg-black/50 backdrop-blur-xs px-2.5 py-1 rounded-lg">
                      <span className="flex items-center gap-1">
                        <Video className="w-3 h-3 text-orange-400" />
                        <span>{c.lessonsCount} Lessons</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-blue-400" />
                        <span>{c.enrollmentsCount} Learners</span>
                      </span>
                    </div>
                  </div>

                  <div className="p-4 space-y-2">
                    <h3 className="text-sm font-bold text-[#0B1B3D] leading-snug line-clamp-1">
                      {c.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {c.subtitle || c.description}
                    </p>

                    <div className="flex items-center justify-between text-xs font-bold pt-1">
                      <span className="text-[#0B1B3D]">{formatPrice(c.price)}</span>
                      <span className="text-emerald-600 text-[11px]">
                        {c.completedLearnersCount} Certified
                      </span>
                    </div>

                    {/* Course Deliverables summary badges */}
                    <div className="flex items-center gap-2 pt-1 text-[10px] font-bold text-slate-500">
                      <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                        {c.assignmentsCount} Assignments
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                        {c.quizzesCount} Quizzes
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-0 border-t border-slate-100 mt-2 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setAssignCourseId(c.id);
                        setShowCreateAssignment(true);
                      }}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-orange-50 hover:bg-orange-100 text-[#FF6B00] border border-orange-200 cursor-pointer"
                      title="Add assignment to this course"
                    >
                      + Assignment
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setQuizCourseId(c.id);
                        setShowCreateQuiz(true);
                      }}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 cursor-pointer"
                      title="Add quiz to this course"
                    >
                      + Quiz
                    </button>
                  </div>

                  <Link
                    href={`/courses/${c.slug}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-[#0B1B3D]"
                  >
                    <span>Preview</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center max-w-md mx-auto space-y-3">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-[#0B1B3D]">No Courses Found</h3>
            <p className="text-xs text-slate-500">
              {courses.length === 0
                ? "You currently have no assigned courses. Create your first course to begin teaching."
                : "No courses match your current search or category filter."}
            </p>
            {courses.length === 0 && (
              <Link
                href="/dashboard/trainer/new-course"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#FF6B00] text-white hover:bg-[#EA580C] shadow-xs"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Create First Course</span>
              </Link>
            )}
          </div>
        )}
      </div>

      {/* UNIFIED RECENT SUBMISSIONS FEED & LEDGER */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-extrabold text-[#0B1B3D] flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-[#FF6B00]" />
              <span>Submissions & Assessment Ledger</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live record of project deliverables and quiz attempts across your assigned tracks
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={submissionSearch}
                onChange={(e) => {
                  setSubmissionSearch(e.target.value);
                  setSubPage(1);
                }}
                placeholder="Search student or assessment..."
                className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-[#FF6B00]"
                aria-label="Search submissions"
              />
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  setSubmissionFilter("ALL");
                  setSubPage(1);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  submissionFilter === "ALL"
                    ? "bg-[#0B1B3D] text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => {
                  setSubmissionFilter("PENDING");
                  setSubPage(1);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  submissionFilter === "PENDING"
                    ? "bg-[#FF6B00] text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Pending
              </button>
              <button
                type="button"
                onClick={() => {
                  setSubmissionFilter("GRADED");
                  setSubPage(1);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  submissionFilter === "GRADED"
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Graded
              </button>
            </div>
          </div>
        </div>

        {paginatedSubmissions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-6">Learner</th>
                  <th className="py-3 px-6">Type & Assessment</th>
                  <th className="py-3 px-6">Course</th>
                  <th className="py-3 px-6">Evaluation / Score</th>
                  <th className="py-3 px-6">Date</th>
                  <th className="py-3 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {paginatedSubmissions.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-6 flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-[#0B1B3D] text-white flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden ring-1 ring-orange-500/20">
                        {item.studentAvatar ? (
                          <img src={item.studentAvatar} alt={item.studentName} className="w-full h-full object-cover" />
                        ) : (
                          item.studentName.charAt(0)
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-[#0B1B3D]">{item.studentName}</div>
                        <div className="text-[10px] text-slate-400">{item.studentEmail}</div>
                      </div>
                    </td>

                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span
                          className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                            item.type === "ASSIGNMENT"
                              ? "bg-blue-50 text-blue-700 border border-blue-200"
                              : "bg-purple-50 text-purple-700 border border-purple-200"
                          }`}
                        >
                          {item.type}
                        </span>
                      </div>
                      <div className="font-semibold text-slate-800 line-clamp-1">
                        {item.title}
                      </div>
                    </td>

                    <td className="py-3.5 px-6 text-slate-600 truncate max-w-xs">
                      {item.courseTitle}
                    </td>

                    <td className="py-3.5 px-6">
                      {item.type === "ASSIGNMENT" ? (
                        item.status === "GRADED" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>{item.score} / {item.maxScore || 100} Pts</span>
                          </span>
                        ) : item.status === "RESUBMIT_REQUESTED" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <Clock className="w-3 h-3" />
                            <span>Revision Needed</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-50 text-[#FF6B00] border border-orange-200">
                            <Clock className="w-3 h-3" />
                            <span>Pending Review</span>
                          </span>
                        )
                      ) : (
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            item.passed
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-red-50 text-red-700 border border-red-200"
                          }`}
                        >
                          {item.passed ? "Passed" : "Needs Retake"}: {item.score}%
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-6 text-slate-400 text-[11px]">
                      {item.createdAt}
                    </td>

                    <td className="py-3.5 px-6 text-right">
                      {item.type === "ASSIGNMENT" && item.rawItem ? (
                        <button
                          type="button"
                          onClick={() => {
                            setGradingModalItem(item.rawItem!);
                            setGradeScore(item.rawItem!.maxScore ? Math.round(item.rawItem!.maxScore * 0.85) : 85);
                            setGradeStatus("GRADED");
                            setGradeFeedback("");
                            setGradingError(null);
                          }}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#FF6B00] hover:bg-[#EA580C] text-white transition-all shadow-xs cursor-pointer"
                        >
                          {item.status === "GRADED" ? "Regrade" : "Grade"}
                        </button>
                      ) : (
                        <Link
                          href={`/courses/${item.courseSlug}`}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                        >
                          Inspect
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-slate-400">
            <FileCheck className="w-9 h-9 mx-auto mb-2 opacity-30" />
            <p className="text-xs font-semibold">No submissions match the current filter.</p>
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>
              Page <span className="font-bold text-slate-700">{subPage}</span> of{" "}
              <span className="font-bold text-slate-700">{totalPages}</span> (
              {filteredSubmissions.length} records)
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setSubPage((p) => Math.max(1, p - 1))}
                disabled={subPage === 1}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-30 cursor-pointer"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setSubPage((p) => Math.min(totalPages, p + 1))}
                disabled={subPage === totalPages}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-30 cursor-pointer"
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ----------------- MODAL: GRADE ASSIGNMENT ----------------- */}
      {gradingModalItem && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-[#0B1B3D] text-white p-6 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF6B00]">
                  Faculty Evaluation Studio
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">
                  Grade: {gradingModalItem.assignmentTitle}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setGradingModalItem(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGrade} className="p-6 space-y-4">
              {gradingError && (
                <div role="alert" className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
                  {gradingError}
                </div>
              )}

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-[#0B1B3D]">{gradingModalItem.studentName}</span>
                  <span className="text-slate-400 ml-1.5">({gradingModalItem.studentEmail})</span>
                </div>
                <span className="text-slate-500 font-mono text-[11px]">
                  {gradingModalItem.submittedAt}
                </span>
              </div>

              {/* Solution Preview */}
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-700 block">
                  Student Solution Notes:
                </span>
                {gradingModalItem.textContent ? (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 font-mono whitespace-pre-wrap max-h-28 overflow-y-auto">
                    {gradingModalItem.textContent}
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 italic">No notes provided by student.</div>
                )}

                {gradingModalItem.fileUrl && (
                  <div className="pt-1.5">
                    <a
                      href={`/api/courses/${gradingModalItem.courseSlug}/assignments/${gradingModalItem.id}/download`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#FF6B00] text-white hover:bg-[#EA580C] shadow-xs"
                      download
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Attached Solution ({gradingModalItem.fileName || "submission.zip"})</span>
                    </a>
                  </div>
                )}
              </div>

              {/* Score & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Assigned Score (Max: {gradingModalItem.maxScore})
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={gradingModalItem.maxScore}
                    value={gradeScore}
                    onChange={(e) => setGradeScore(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl text-xs font-bold text-[#0B1B3D] border border-slate-200 focus:outline-hidden focus:border-[#FF6B00]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Evaluation Status
                  </label>
                  <select
                    value={gradeStatus}
                    onChange={(e) => setGradeStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs font-bold text-[#0B1B3D] border border-slate-200 focus:outline-hidden focus:border-[#FF6B00] bg-white"
                  >
                    <option value="GRADED">Approved & Graded</option>
                    <option value="RESUBMIT_REQUESTED">Request Resubmission</option>
                  </select>
                </div>
              </div>

              {/* Feedback Textarea */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Faculty Constructive Feedback & Rubric Notes *
                </label>
                <textarea
                  rows={4}
                  value={gradeFeedback}
                  onChange={(e) => setGradeFeedback(e.target.value)}
                  placeholder="Detail strengths, code review points, and actionable guidance..."
                  className="w-full p-3 rounded-xl text-xs text-slate-700 border border-slate-200 focus:outline-hidden focus:border-[#FF6B00]"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setGradingModalItem(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 rounded-xl bg-[#FF6B00] hover:bg-[#EA580C] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Evaluation</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ----------------- MODAL: CREATE ASSIGNMENT ----------------- */}
      {showCreateAssignment && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-[#0B1B3D] text-white p-6 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF6B00]">
                  Curriculum Project Authoring
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">
                  Create Practical Assignment
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateAssignment(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAssignment} className="p-6 space-y-4">
              {assignmentError && (
                <div role="alert" className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
                  {assignmentError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Assign to Course Track *
                </label>
                <select
                  value={assignCourseId}
                  onChange={(e) => setAssignCourseId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs font-bold text-[#0B1B3D] border border-slate-200 focus:outline-hidden bg-white"
                  required
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Assignment Title *
                </label>
                <input
                  type="text"
                  value={assignTitle}
                  onChange={(e) => setAssignTitle(e.target.value)}
                  placeholder="e.g. Capstone Project: Deploy Secure Multi-Tier Cloud API"
                  className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 focus:outline-hidden focus:border-[#FF6B00]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Maximum Score (Pts)
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={1000}
                    value={assignMaxScore}
                    onChange={(e) => setAssignMaxScore(parseInt(e.target.value, 10) || 100)}
                    className="w-full px-3 py-2 rounded-xl text-xs font-bold text-[#0B1B3D] border border-slate-200 focus:outline-hidden focus:border-[#FF6B00]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Optional Due Date
                  </label>
                  <input
                    type="date"
                    value={assignDueDate}
                    onChange={(e) => setAssignDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs text-slate-700 border border-slate-200 focus:outline-hidden focus:border-[#FF6B00]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Rubric Guidelines & Instructions *
                </label>
                <textarea
                  rows={4}
                  value={assignDesc}
                  onChange={(e) => setAssignDesc(e.target.value)}
                  placeholder="Detail the technical specifications, acceptance criteria, submission format (code repo or PDF), and evaluation grading rubric..."
                  className="w-full p-3 rounded-xl text-xs text-slate-700 border border-slate-200 focus:outline-hidden focus:border-[#FF6B00]"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateAssignment(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 rounded-xl bg-[#FF6B00] hover:bg-[#EA580C] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Publish Assignment</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ----------------- MODAL: CREATE QUIZ ----------------- */}
      {showCreateQuiz && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
        >
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-[#0B1B3D] text-white p-6 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF6B00]">
                  Assessment Builder
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">
                  Create Assessment Quiz
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateQuiz(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateQuiz} className="p-6 space-y-5">
              {quizError && (
                <div role="alert" className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
                  {quizError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Target Course *
                  </label>
                  <select
                    value={quizCourseId}
                    onChange={(e) => setQuizCourseId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs font-bold text-[#0B1B3D] border border-slate-200 focus:outline-hidden bg-white"
                    required
                  >
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Passing Benchmark Score (%)
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={100}
                    value={quizPassingScore}
                    onChange={(e) => setQuizPassingScore(parseInt(e.target.value, 10) || 70)}
                    className="w-full px-3 py-2 rounded-xl text-xs font-bold text-[#0B1B3D] border border-slate-200 focus:outline-hidden focus:border-[#FF6B00]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Quiz Title *
                </label>
                <input
                  type="text"
                  value={quizTitle}
                  onChange={(e) => setQuizTitle(e.target.value)}
                  placeholder="e.g. Module 1 Comprehensive Knowledge Assessment"
                  className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 focus:outline-hidden focus:border-[#FF6B00]"
                  required
                />
              </div>

              {/* Questions Builder */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-[#0B1B3D] uppercase tracking-wider">
                    Questions ({quizQuestions.length})
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setQuizQuestions((prev) => [
                        ...prev,
                        {
                          text: "",
                          options: ["", "", "", ""],
                          correctIndex: 0,
                          explanation: "",
                        },
                      ]);
                    }}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#FF6B00] hover:underline"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Add Another Question</span>
                  </button>
                </div>

                {quizQuestions.map((q, qIndex) => (
                  <div
                    key={qIndex}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#0B1B3D]">
                        Question #{qIndex + 1}
                      </span>
                      {quizQuestions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            setQuizQuestions((prev) => prev.filter((_, idx) => idx !== qIndex));
                          }}
                          className="text-[11px] font-bold text-red-600 hover:underline"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <input
                      type="text"
                      value={q.text}
                      onChange={(e) => {
                        const newQuestions = [...quizQuestions];
                        newQuestions[qIndex].text = e.target.value;
                        setQuizQuestions(newQuestions);
                      }}
                      placeholder="Enter question prompt..."
                      className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 bg-white focus:outline-hidden focus:border-[#FF6B00]"
                      required
                    />

                    <div className="space-y-2 pt-1">
                      <span className="text-[11px] font-bold text-slate-500 block">
                        Choices (select radio button for correct answer):
                      </span>
                      {q.options.map((opt, optIndex) => (
                        <div key={optIndex} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name={`correct-${qIndex}`}
                            checked={q.correctIndex === optIndex}
                            onChange={() => {
                              const newQuestions = [...quizQuestions];
                              newQuestions[qIndex].correctIndex = optIndex;
                              setQuizQuestions(newQuestions);
                            }}
                            className="text-[#FF6B00] focus:ring-[#FF6B00]"
                          />
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => {
                              const newQuestions = [...quizQuestions];
                              newQuestions[qIndex].options[optIndex] = e.target.value;
                              setQuizQuestions(newQuestions);
                            }}
                            placeholder={`Option ${String.fromCharCode(65 + optIndex)}`}
                            className="flex-1 px-3 py-1.5 rounded-lg text-xs border border-slate-200 bg-white focus:outline-hidden focus:border-[#FF6B00]"
                            required
                          />
                        </div>
                      ))}
                    </div>

                    <input
                      type="text"
                      value={q.explanation}
                      onChange={(e) => {
                        const newQuestions = [...quizQuestions];
                        newQuestions[qIndex].explanation = e.target.value;
                        setQuizQuestions(newQuestions);
                      }}
                      placeholder="Optional explanation shown upon review..."
                      className="w-full px-3 py-1.5 rounded-lg text-xs border border-slate-200 bg-white text-slate-500"
                    />
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateQuiz(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 rounded-xl bg-[#FF6B00] hover:bg-[#EA580C] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Publish Quiz</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ----------------- MODAL: CREATE LESSON ----------------- */}
      {showCreateLesson && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-[#0B1B3D] text-white p-6 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF6B00]">
                  Syllabus Authoring
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">
                  Add Lesson to Curriculum
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateLesson(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLesson} className="p-6 space-y-4">
              {lessonError && (
                <div role="alert" className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
                  {lessonError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Target Course Track *
                </label>
                <select
                  value={lessonCourseId}
                  onChange={(e) => {
                    const newCourseId = e.target.value;
                    setLessonCourseId(newCourseId);
                    const selCourse = courses.find((c) => c.id === newCourseId);
                    setLessonSectionId(selCourse?.sections[0]?.id || "");
                  }}
                  className="w-full px-3 py-2 rounded-xl text-xs font-bold text-[#0B1B3D] border border-slate-200 focus:outline-hidden bg-white"
                  required
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Target Section / Module *
                </label>
                <select
                  value={lessonSectionId}
                  onChange={(e) => setLessonSectionId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs font-bold text-[#0B1B3D] border border-slate-200 focus:outline-hidden bg-white"
                  required
                >
                  {availableSections.length > 0 ? (
                    availableSections.map((sec) => (
                      <option key={sec.id} value={sec.id}>
                        {sec.title}
                      </option>
                    ))
                  ) : (
                    <option value="">No sections found for this course</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Lesson Title *
                </label>
                <input
                  type="text"
                  value={lessonTitle}
                  onChange={(e) => setLessonTitle(e.target.value)}
                  placeholder="e.g. Asynchronous Event Streams with Kafka"
                  className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 focus:outline-hidden focus:border-[#FF6B00]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Duration Estimate
                  </label>
                  <input
                    type="text"
                    value={lessonDuration}
                    onChange={(e) => setLessonDuration(e.target.value)}
                    placeholder="e.g. 15 mins"
                    className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 focus:outline-hidden focus:border-[#FF6B00]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Video Embed URL
                  </label>
                  <input
                    type="url"
                    value={lessonVideoUrl}
                    onChange={(e) => setLessonVideoUrl(e.target.value)}
                    placeholder="https://www.youtube.com/embed/..."
                    className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 focus:outline-hidden focus:border-[#FF6B00]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Lesson Content & Technical Notes
                </label>
                <textarea
                  rows={3}
                  value={lessonContent}
                  onChange={(e) => setLessonContent(e.target.value)}
                  placeholder="Lecture notes, terminal commands, or external documentation references..."
                  className="w-full p-3 rounded-xl text-xs text-slate-700 border border-slate-200 focus:outline-hidden focus:border-[#FF6B00]"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="lessonIsFree"
                  checked={lessonIsFree}
                  onChange={(e) => setLessonIsFree(e.target.checked)}
                  className="rounded text-[#FF6B00] focus:ring-[#FF6B00]"
                />
                <label htmlFor="lessonIsFree" className="text-xs font-semibold text-slate-700 cursor-pointer">
                  Allow Free Preview (accessible to un-enrolled students)
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateLesson(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending || !lessonSectionId}
                  className="px-5 py-2 rounded-xl bg-[#FF6B00] hover:bg-[#EA580C] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Lesson</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
