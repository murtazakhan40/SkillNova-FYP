"use client";

import React, { useState, useTransition, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  CheckCircle2, 
  XCircle,
  Circle, 
  PlayCircle, 
  ArrowLeft, 
  ArrowRight, 
  Award, 
  BookOpen, 
  FileText, 
  HelpCircle,
  Download,
  Upload,
  Trash2,
  MessageSquare,
  Send,
  Flag,
  Clock,
  Sparkles,
  Paperclip,
  ExternalLink,
  FileCheck,
  ChevronDown,
  ChevronUp,
  Loader2,
  FolderArchive,
  Lock
} from "lucide-react";
import { toggleLessonProgress, claimCertificateAction } from "@/app/actions/learning";
import {
  submitAssignmentAction,
  uploadLessonResourceAction,
  deleteLessonResourceAction,
  postLessonDiscussionAction,
  reportLessonDiscussionAction,
  deleteLessonDiscussionAction,
} from "@/app/actions/classroom";
import { formatDate } from "@/lib/utils";

export interface SerializedResource {
  id: string;
  title: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  fileType: string;
  createdAt: string;
}

export interface SerializedDiscussion {
  id: string;
  content: string;
  isAnswer: boolean;
  reported: boolean;
  createdAt: string;
  user: {
    id: string;
    name: string;
    role: string;
    avatar: string | null;
  };
}

export interface SerializedSubmission {
  id: string;
  textContent: string | null;
  fileUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
  score: number | null;
  feedback: string | null;
  status: string;
  submittedAt: string;
  gradedAt: string | null;
}

export interface SerializedAssignment {
  id: string;
  title: string;
  description: string;
  dueDate: string | null;
  maxScore: number;
  mySubmission: SerializedSubmission | null;
}

export interface SerializedLesson {
  id: string;
  title: string;
  duration: string;
  videoUrl: string | null;
  content: string | null;
  order: number;
  sectionId: string;
  resources: SerializedResource[];
  discussions: SerializedDiscussion[];
}

export interface SerializedSection {
  id: string;
  title: string;
  order: number;
  lessons: SerializedLesson[];
}

export interface SerializedQuizInfo {
  id: string;
  title: string;
  passingScore?: number;
  isPassed?: boolean;
  bestScore?: number | null;
  attemptCount?: number;
}

export interface ClassroomPlayerProps {
  course: {
    id: string;
    title: string;
    slug: string;
    category: { name: string };
    instructor: { id: string; name: string };
    sections: SerializedSection[];
    quizzes: SerializedQuizInfo[];
    assignments: SerializedAssignment[];
  };
  currentLesson: SerializedLesson;
  completedLessonIds: string[];
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  currentProgress: number;
  certificateCode: string | null;
  isInstructor: boolean;
}

export function ClassroomPlayer({
  course,
  currentLesson,
  completedLessonIds,
  user,
  currentProgress,
  certificateCode,
  isInstructor,
}: ClassroomPlayerProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"NOTES" | "RESOURCES" | "ASSIGNMENT" | "QA">("NOTES");
  const [isPending, startTransition] = useTransition();

  // Collapsible sections
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  // Resources state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [resourceTitle, setResourceTitle] = useState("");
  const [resourceFile, setResourceFile] = useState<File | null>(null);
  const [resourceStatus, setResourceStatus] = useState<{ error?: string; success?: string } | null>(null);

  // Assignment state
  const currentAssignment = course.assignments[0] || null;
  const [activeSubmission, setActiveSubmission] = useState<SerializedSubmission | null>(
    currentAssignment?.mySubmission || null
  );

  useEffect(() => {
    if (currentAssignment?.mySubmission) {
      setActiveSubmission(currentAssignment.mySubmission);
    }
  }, [currentAssignment?.mySubmission]);

  const [assignmentText, setAssignmentText] = useState("");
  const [assignmentFile, setAssignmentFile] = useState<File | null>(null);
  const [assignmentStatus, setAssignmentStatus] = useState<{ error?: string; success?: string } | null>(null);
  const [isEditingSubmission, setIsEditingSubmission] = useState(false);

  // Q&A state
  const [questionContent, setQuestionContent] = useState("");
  const [isAnswerPost, setIsAnswerPost] = useState(false);
  const [qaStatus, setQaStatus] = useState<{ error?: string; success?: string } | null>(null);

  // Certificate claim state
  const [currentCertificateCode, setCurrentCertificateCode] = useState<string | null>(certificateCode);
  const [isClaimingCert, setIsClaimingCert] = useState(false);
  const [certClaimError, setCertClaimError] = useState<string | null>(null);
  const [certClaimSuccess, setCertClaimSuccess] = useState<string | null>(null);

  useEffect(() => {
    setCurrentCertificateCode(certificateCode);
  }, [certificateCode]);

  // Flattened lessons list
  const allLessons = course.sections.flatMap((s) => s.lessons);
  const currentLessonIndex = allLessons.findIndex((l) => l.id === currentLesson.id);
  const prevLesson = currentLessonIndex > 0 ? allLessons[currentLessonIndex - 1] : null;
  const nextLesson = currentLessonIndex < allLessons.length - 1 ? allLessons[currentLessonIndex + 1] : null;

  const isCurrentCompleted = completedLessonIds.includes(currentLesson.id);

  // Rigorous Course Completion & Clearance Calculation
  const totalLessons = allLessons.length;
  const completedLessonsCount = completedLessonIds.length;
  const isLessonsComplete = totalLessons > 0 && completedLessonsCount >= totalLessons;

  const hasQuizzes = course.quizzes.length > 0;
  const isQuizzesCleared = !hasQuizzes || course.quizzes.every((q) => q.isPassed);

  const hasAssignments = course.assignments.length > 0;
  const isAssignmentsCleared =
    !hasAssignments ||
    course.assignments.every((a) => {
      const sub = a.id === currentAssignment?.id && activeSubmission ? activeSubmission : a.mySubmission;
      return (
        sub?.status === "GRADED" &&
        sub.score !== null &&
        sub.score / a.maxScore >= 0.7
      );
    });

  const isEverythingCleared = isLessonsComplete && isQuizzesCleared && isAssignmentsCleared;

  const handleClaimCertificate = () => {
    setIsClaimingCert(true);
    setCertClaimError(null);
    startTransition(async () => {
      try {
        const res = await claimCertificateAction(course.id);
        if (res.certificateCode) {
          setCurrentCertificateCode(res.certificateCode);
          setCertClaimSuccess(`Certificate ${res.certificateCode} issued successfully!`);
          router.refresh();
        }
      } catch (err: unknown) {
        setCertClaimError(err instanceof Error ? err.message : "Failed to claim certificate.");
      } finally {
        setIsClaimingCert(false);
      }
    });
  };

  const toggleSection = (sectionId: string) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // 1. Toggle Progress
  const handleToggleProgress = () => {
    startTransition(async () => {
      try {
        await toggleLessonProgress(currentLesson.id, course.slug);
      } catch (err: unknown) {
        console.error("Failed to toggle progress:", err);
      }
    });
  };

  // 2. Upload Resource
  const handleUploadResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resourceTitle.trim() || !resourceFile) {
      setResourceStatus({ error: "Please enter a resource title and select a file." });
      return;
    }

    setResourceStatus(null);
    const formData = new FormData();
    formData.set("lessonId", currentLesson.id);
    formData.set("title", resourceTitle.trim());
    formData.set("file", resourceFile);

    startTransition(async () => {
      try {
        await uploadLessonResourceAction(formData);
        setResourceStatus({ success: "Resource file uploaded and published successfully!" });
        setResourceTitle("");
        setResourceFile(null);
        setTimeout(() => setShowUploadModal(false), 1200);
      } catch (err: unknown) {
        setResourceStatus({
          error: err instanceof Error ? err.message : "Failed to upload file.",
        });
      }
    });
  };

  // 3. Delete Resource
  const handleDeleteResource = (resourceId: string) => {
    if (!confirm("Are you sure you want to permanently delete this resource?")) return;
    startTransition(async () => {
      try {
        await deleteLessonResourceAction(resourceId);
      } catch (err: unknown) {
        alert(err instanceof Error ? err.message : "Failed to delete resource.");
      }
    });
  };

  // 4. Submit Assignment
  const handleSubmitAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAssignment) return;

    if (!assignmentText.trim() && !assignmentFile) {
      setAssignmentStatus({
        error: "Please provide either notes/repo URL or attach your project file.",
      });
      return;
    }

    setAssignmentStatus(null);
    const formData = new FormData();
    formData.set("assignmentId", currentAssignment.id);
    formData.set("courseSlug", course.slug);
    formData.set("textContent", assignmentText.trim());
    if (assignmentFile) {
      formData.set("file", assignmentFile);
    }

    startTransition(async () => {
      try {
        const res = await submitAssignmentAction(formData);
        if (res?.submission) {
          setActiveSubmission(res.submission);
        }
        setAssignmentStatus({
          success: "Assignment submitted successfully! Your active submission details are displayed below.",
        });
        setIsEditingSubmission(false);
        setAssignmentFile(null);
        router.refresh();
      } catch (err: unknown) {
        setAssignmentStatus({
          error: err instanceof Error ? err.message : "Submission failed. Please verify file requirements.",
        });
      }
    });
  };

  // 5. Post Discussion
  const handlePostDiscussion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionContent.trim()) return;

    setQaStatus(null);
    const formData = new FormData();
    formData.set("lessonId", currentLesson.id);
    formData.set("content", questionContent.trim());
    formData.set("isAnswer", isAnswerPost ? "true" : "false");

    startTransition(async () => {
      try {
        await postLessonDiscussionAction(formData);
        setQuestionContent("");
        setIsAnswerPost(false);
        setQaStatus({ success: "Message posted to lesson discussion." });
      } catch (err: unknown) {
        setQaStatus({
          error: err instanceof Error ? err.message : "Failed to post message.",
        });
      }
    });
  };

  // 6. Report Discussion
  const handleReportDiscussion = (discussionId: string) => {
    startTransition(async () => {
      try {
        await reportLessonDiscussionAction(discussionId);
        alert("This comment has been reported to course moderators for review.");
      } catch (err: unknown) {
        alert(err instanceof Error ? err.message : "Unable to report comment.");
      }
    });
  };

  // 7. Delete Discussion
  const handleDeleteDiscussion = (discussionId: string) => {
    if (!confirm("Delete this discussion message?")) return;
    startTransition(async () => {
      try {
        await deleteLessonDiscussionAction(discussionId);
      } catch (err: unknown) {
        alert(err instanceof Error ? err.message : "Unable to delete comment.");
      }
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      {/* Top Header Bar */}
      <div className="bg-[#0B1B3D] text-white py-4 px-4 sm:px-8 border-b border-slate-800 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href={`/courses/${course.slug}`}
              className="p-2 rounded-xl bg-[#132752] text-slate-300 hover:text-white hover:bg-[#1B376F] transition-colors"
              title="Return to Course Landing Page"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF6B00]">
                {course.category.name}
              </span>
              <h1 className="text-sm sm:text-base font-bold truncate max-w-xs sm:max-w-lg">
                {course.title}
              </h1>
            </div>
          </div>

          {/* Course Progress Indicator */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-xs font-bold text-white flex items-center justify-end gap-1.5">
                <span>Course Progress: {currentProgress}%</span>
              </div>
              <div className="text-[10px] text-slate-400">
                {completedLessonIds.length} of {allLessons.length} lessons completed
              </div>
            </div>
            <div className="w-24 sm:w-36 bg-slate-800 rounded-full h-2.5 overflow-hidden border border-slate-700">
              <div
                className="bg-gradient-to-r from-[#FF6B00] to-amber-400 h-2.5 rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${currentProgress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Certificate Notice & Clearance Banner */}
      {currentCertificateCode ? (
        <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-emerald-800 text-white py-3 px-4 shadow-md">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/30 border border-emerald-400/50 flex items-center justify-center shrink-0">
                <Award className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <span className="font-bold text-white text-sm block">Academic Milestone Achieved!</span>
                <span className="text-emerald-100 text-[11px]">
                  Official verified credential issued with ID:{" "}
                  <code className="bg-emerald-950/60 px-2 py-0.5 rounded font-mono font-bold text-amber-200 border border-emerald-600/50">
                    {currentCertificateCode}
                  </code>
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href={`/verify?code=${encodeURIComponent(currentCertificateCode)}`}
                className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer text-xs"
              >
                <Award className="w-4 h-4 text-slate-900" />
                <span>View Verified Credential</span>
              </Link>
              <a
                href={`/api/certificates/${encodeURIComponent(currentCertificateCode)}/download`}
                className="px-3.5 py-2 bg-emerald-950/60 hover:bg-emerald-950 text-white font-bold rounded-xl border border-emerald-400/40 transition-all text-xs flex items-center gap-1.5"
                download
              >
                <Download className="w-3.5 h-3.5 text-amber-300" />
                <span>Download PDF</span>
              </a>
            </div>
          </div>
        </div>
      ) : isEverythingCleared ? (
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white py-3.5 px-4 shadow-md animate-in fade-in">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-extrabold text-white text-sm block">All Course Requirements 100% Cleared! 🎓</span>
                <span className="text-amber-100 text-[11px]">
                  All lectures completed, assessment quiz passed, and capstone deliverable approved! Your verified certificate is ready.
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleClaimCertificate}
              disabled={isClaimingCert}
              className="px-5 py-2.5 bg-white hover:bg-amber-50 text-[#0B1B3D] font-extrabold rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer text-xs disabled:opacity-60 shrink-0"
            >
              {isClaimingCert ? <Loader2 className="w-4 h-4 animate-spin text-[#FF6B00]" /> : <Award className="w-4 h-4 text-[#FF6B00]" />}
              <span>Claim Official Certificate 🎓</span>
            </button>
          </div>
        </div>
      ) : null}

      {/* Claim Error Feedback */}
      {certClaimError && (
        <div className="bg-red-500 text-white text-xs px-4 py-2 text-center font-bold">
          {certClaimError}
        </div>
      )}
      {certClaimSuccess && (
        <div className="bg-emerald-600 text-white text-xs px-4 py-2 text-center font-bold">
          {certClaimSuccess}
        </div>
      )}

      {/* Main Split Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Player & Interactive Content (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Embedded Video Display */}
            <div className="bg-black rounded-2xl overflow-hidden shadow-xl aspect-video relative border border-slate-800">
              {currentLesson.videoUrl ? (
                <iframe
                  src={currentLesson.videoUrl}
                  title={currentLesson.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center bg-slate-950">
                  <PlayCircle className="w-16 h-16 text-[#FF6B00] mb-2" />
                  <p className="text-sm font-semibold text-slate-200">Interactive Interactive Classroom Session</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm">
                    Review lecture notes and code repository resources below.
                  </p>
                </div>
              )}
            </div>

            {/* Transparent Self-Paced Completion Rule Banner */}
            <div className="p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-xl flex items-start gap-2.5 text-xs text-slate-700">
              <Clock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-blue-900">Self-Paced Progress Rule: </span>
                <span>
                  Review the video lecture and accompanying materials at your own speed, then click <strong>&quot;Mark as Completed&quot;</strong>. Progress percentage and cryptographic certificate eligibility recalculate server-side upon completion.
                </span>
              </div>
            </div>

            {/* Lesson Title & Completion Action Bar */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Lesson {currentLessonIndex + 1} of {allLessons.length} • {currentLesson.duration}
                </span>
                <h2 className="text-xl font-extrabold text-[#0B1B3D] mt-0.5">
                  {currentLesson.title}
                </h2>
              </div>

              <button
                type="button"
                onClick={handleToggleProgress}
                disabled={isPending}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
                  isCurrentCompleted
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100"
                    : "bg-[#FF6B00] hover:bg-[#EA580C] text-white hover:scale-[1.02]"
                } ${isPending ? "opacity-75 cursor-not-allowed" : ""}`}
              >
                {isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className={`w-4 h-4 ${isCurrentCompleted ? "text-emerald-600" : "text-white"}`} />
                )}
                <span>
                  {isCurrentCompleted ? "Completed ✓" : "Mark as Completed"}
                </span>
              </button>
            </div>

            {/* Tab Navigation Menu */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="flex border-b border-slate-200 bg-slate-50/70 p-1.5 gap-1.5 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setActiveTab("NOTES")}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    activeTab === "NOTES"
                      ? "bg-white text-[#0B1B3D] shadow-xs border border-slate-200/80"
                      : "text-slate-500 hover:text-slate-800 hover:bg-white/50"
                  }`}
                >
                  <FileText className="w-4 h-4 text-[#FF6B00]" />
                  <span>Lecture Notes</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("RESOURCES")}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    activeTab === "RESOURCES"
                      ? "bg-white text-[#0B1B3D] shadow-xs border border-slate-200/80"
                      : "text-slate-500 hover:text-slate-800 hover:bg-white/50"
                  }`}
                >
                  <Paperclip className="w-4 h-4 text-blue-600" />
                  <span>Downloads ({currentLesson.resources.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("ASSIGNMENT")}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    activeTab === "ASSIGNMENT"
                      ? "bg-white text-[#0B1B3D] shadow-xs border border-slate-200/80"
                      : "text-slate-500 hover:text-slate-800 hover:bg-white/50"
                  }`}
                >
                  <FileCheck className="w-4 h-4 text-emerald-600" />
                  <span>
                    Assignment
                    {activeSubmission && (
                      <span className="ml-1.5 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        Submitted ✓
                      </span>
                    )}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("QA")}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    activeTab === "QA"
                      ? "bg-white text-[#0B1B3D] shadow-xs border border-slate-200/80"
                      : "text-slate-500 hover:text-slate-800 hover:bg-white/50"
                  }`}
                >
                  <MessageSquare className="w-4 h-4 text-purple-600" />
                  <span>Q&A Inquiry ({currentLesson.discussions.length})</span>
                </button>
              </div>

              {/* Tab 1: Lecture Notes */}
              {activeTab === "NOTES" && (
                <div className="p-6 sm:p-8 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Curriculum Specifications & Overview
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      Author: {course.instructor.name}
                    </span>
                  </div>
                  <div className="prose prose-slate max-w-none text-sm text-slate-700 leading-relaxed whitespace-pre-line font-normal">
                    {currentLesson.content ||
                      "In this lecture, students delve into software engineering design patterns, state hydration paradigms, and scalable architecture."}
                  </div>
                </div>
              )}

              {/* Tab 2: Resources & Downloads */}
              {activeTab === "RESOURCES" && (
                <div className="p-6 sm:p-8 space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <h3 className="text-sm font-bold text-[#0B1B3D]">
                        Authorized Lesson Downloads & Assets
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Protected materials accessible exclusively to actively enrolled students.
                      </p>
                    </div>

                    {isInstructor && (
                      <button
                        type="button"
                        onClick={() => setShowUploadModal(true)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#0B1B3D] text-white hover:bg-[#132752] transition-colors shadow-xs"
                      >
                        <Upload className="w-3.5 h-3.5 text-[#FF6B00]" />
                        <span>Upload Material</span>
                      </button>
                    )}
                  </div>

                  {/* Upload Modal for Instructors */}
                  {showUploadModal && (
                    <form
                      onSubmit={handleUploadResource}
                      className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#0B1B3D] flex items-center gap-2">
                          <Upload className="w-4 h-4 text-[#FF6B00]" />
                          <span>Publish Lesson Resource</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowUploadModal(false)}
                          className="text-xs text-slate-400 hover:text-slate-600"
                        >
                          Cancel
                        </button>
                      </div>

                      {resourceStatus?.error && (
                        <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
                          {resourceStatus.error}
                        </div>
                      )}
                      {resourceStatus?.success && (
                        <div className="p-3 bg-emerald-50 text-emerald-700 text-xs rounded-xl border border-emerald-200">
                          {resourceStatus.success}
                        </div>
                      )}

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">
                          Resource Display Title
                        </label>
                        <input
                          type="text"
                          value={resourceTitle}
                          onChange={(e) => setResourceTitle(e.target.value)}
                          placeholder="e.g. Next.js Architecture Cheatsheet (PDF)"
                          className="w-full px-3.5 py-2 rounded-xl text-xs border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                          required
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">
                          File Attachment (Max 15MB: PDF, ZIP, DOCX, Code)
                        </label>
                        <input
                          type="file"
                          onChange={(e) => setResourceFile(e.target.files?.[0] || null)}
                          className="w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#FF6B00] file:text-white hover:file:bg-[#EA580C]"
                          required
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isPending}
                        className="w-full py-2.5 rounded-xl bg-[#FF6B00] hover:bg-[#EA580C] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2"
                      >
                        {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                        <span>Publish to Enrolled Students</span>
                      </button>
                    </form>
                  )}

                  {/* Resource List */}
                  {currentLesson.resources.length > 0 ? (
                    <div className="space-y-3">
                      {currentLesson.resources.map((res) => (
                        <div
                          key={res.id}
                          className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors flex items-center justify-between gap-4"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#FF6B00] flex items-center justify-center shrink-0">
                              <FolderArchive className="w-5 h-5" />
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-[#0B1B3D]">{res.title}</h4>
                              <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5">
                                <span className="font-mono">{res.fileName}</span>
                                <span>•</span>
                                <span>{formatBytes(res.fileSize)}</span>
                                <span>•</span>
                                <span>{formatDate(res.createdAt)}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <a
                              href={`/api/courses/${course.slug}/resources/${res.id}/download`}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 hover:bg-[#FF6B00] hover:text-white text-slate-700 transition-colors"
                              download
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Download</span>
                            </a>

                            {isInstructor && (
                              <button
                                type="button"
                                onClick={() => handleDeleteResource(res.id)}
                                className="p-1.5 text-slate-400 hover:text-red-600 transition-colors"
                                title="Delete Resource"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                      <Paperclip className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-xs font-bold text-slate-600">No supplementary downloads for this lesson</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Your instructor will publish reference cheat sheets and starter code repositories here.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: Project Assignment */}
              {activeTab === "ASSIGNMENT" && (
                <div className="p-6 sm:p-8 space-y-6">
                  {currentAssignment ? (
                    <div className="space-y-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF6B00]">
                            Graded Capstone Assignment
                          </span>
                          <h3 className="text-lg font-bold text-[#0B1B3D] mt-0.5">
                            {currentAssignment.title}
                          </h3>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="px-3 py-1 bg-slate-100 rounded-lg text-xs font-bold text-slate-700">
                            Max Score: {currentAssignment.maxScore} Pts
                          </span>
                          {currentAssignment.dueDate && (
                            <span className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-xs font-bold flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5" />
                              <span>Due: {formatDate(currentAssignment.dueDate)}</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Assignment Description */}
                      <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
                        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                          Assignment Brief & Rubric
                        </div>
                        <div className="prose prose-slate text-xs text-slate-700 leading-relaxed whitespace-pre-line font-normal">
                          {currentAssignment.description}
                        </div>
                      </div>

                      {/* Current Student Submission Status */}
                      {activeSubmission && !isEditingSubmission ? (
                        <div className="space-y-4">
                          {/* Success Notification Banner */}
                          {assignmentStatus?.success && (
                            <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50 border-2 border-emerald-400 text-emerald-950 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                              <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                                  <CheckCircle2 className="w-6 h-6" />
                                </div>
                                <div>
                                  <h4 className="text-sm font-heading font-extrabold text-emerald-950">
                                    Assignment Submitted Successfully!
                                  </h4>
                                  <p className="text-xs text-emerald-800 mt-0.5">
                                    Your project solution has been safely recorded in the SkillNova Academic Registry and queued for faculty grading.
                                  </p>
                                  <div className="text-[11px] text-emerald-700 font-semibold mt-1 flex items-center gap-2">
                                    <span>Submitted: {formatDate(activeSubmission.submittedAt)}</span>
                                    <span>•</span>
                                    <span className="uppercase font-bold tracking-wider">Status: {activeSubmission.status}</span>
                                  </div>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => setActiveTab("NOTES")}
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#0B1B3D] text-white hover:bg-[#132752] transition-colors shadow-sm shrink-0 cursor-pointer"
                              >
                                <ArrowLeft className="w-3.5 h-3.5 text-[#FF6B00]" />
                                <span>Back to Course Lessons</span>
                              </button>
                            </div>
                          )}

                          {/* Active Submission Card */}
                          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                              <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                <span className="text-xs font-bold text-[#0B1B3D]">Your Active Submission</span>
                                <span className="text-[11px] text-slate-400 font-normal">
                                  (Submitted {formatDate(activeSubmission.submittedAt)})
                                </span>
                              </div>
                              <span
                                className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                                  activeSubmission.status === "GRADED"
                                    ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                    : activeSubmission.status === "RESUBMIT_REQUESTED"
                                    ? "bg-amber-100 text-amber-800 border border-amber-300"
                                    : "bg-blue-100 text-blue-800 border border-blue-300"
                                }`}
                              >
                                {activeSubmission.status === "SUBMITTED"
                                  ? "SUBMITTED • PENDING REVIEW"
                                  : activeSubmission.status}
                              </span>
                            </div>

                            {/* Graded Feedback Box if Graded */}
                            {activeSubmission.score !== null && (
                              (() => {
                                const scoreRatio = activeSubmission.score / currentAssignment.maxScore;
                                const isPass = scoreRatio >= 0.7;

                                return (
                                  <div
                                    className={`p-5 rounded-2xl border ${
                                      isPass
                                        ? "bg-emerald-50/90 border-emerald-300 text-emerald-950"
                                        : "bg-red-50/90 border-red-300 text-red-950"
                                    } space-y-2`}
                                  >
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                      <div className="flex items-center gap-2">
                                        {isPass ? (
                                          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                                        ) : (
                                          <XCircle className="w-5 h-5 text-red-600 shrink-0" />
                                        )}
                                        <span className="text-xs font-extrabold uppercase tracking-wider">
                                          {isPass
                                            ? "ASSIGNMENT STATUS: PASSED (✓)"
                                            : "ASSIGNMENT STATUS: FAILED / NEEDS REVISION (✗)"}
                                        </span>
                                      </div>

                                      <span className="text-xs font-extrabold">
                                        Grade: {activeSubmission.score} / {currentAssignment.maxScore} (
                                        {Math.round(scoreRatio * 100)}%)
                                      </span>
                                    </div>

                                    <div className="text-[10px] text-slate-500 pl-7">
                                      Evaluated on{" "}
                                      {activeSubmission.gradedAt
                                        ? formatDate(activeSubmission.gradedAt)
                                        : "Recently"}
                                    </div>

                                    {activeSubmission.feedback && (
                                      <p className="text-xs leading-relaxed pl-7 pt-1 border-t border-slate-200/60 mt-2">
                                        <strong>Faculty Feedback:</strong>{" "}
                                        {activeSubmission.feedback}
                                      </p>
                                    )}
                                  </div>
                                );
                              })()
                            )}

                            {/* Student Submission Text / Repository Link */}
                            {activeSubmission.textContent && (
                              <div className="space-y-1.5">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                  Submitted Notes & Solution Link
                                </span>
                                <div className="text-xs text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100 font-mono whitespace-pre-wrap flex flex-col gap-2">
                                  <span>{activeSubmission.textContent}</span>
                                  {activeSubmission.textContent.startsWith("http") && (
                                    <a
                                      href={activeSubmission.textContent}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF6B00] hover:underline w-fit mt-1"
                                    >
                                      <span>Open Submitted Link</span>
                                      <ExternalLink className="w-3.5 h-3.5" />
                                    </a>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Attached File */}
                            {activeSubmission.fileUrl && (
                              <div className="space-y-1.5">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                  Attached Solution Deliverable
                                </span>
                                <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                                  <div className="flex items-center gap-2.5">
                                    <Paperclip className="w-4 h-4 text-[#FF6B00]" />
                                    <div>
                                      <span className="font-semibold text-slate-800 block">
                                        {activeSubmission.fileName || "Submitted_Project_Archive.zip"}
                                      </span>
                                      {activeSubmission.fileSize && (
                                        <span className="text-[10px] text-slate-400">
                                          {formatBytes(activeSubmission.fileSize)}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <a
                                    href={`/api/courses/${course.slug}/assignments/${activeSubmission.id}/download`}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-white border border-slate-200 text-[#0B1B3D] hover:bg-slate-100 transition-colors shadow-xs"
                                    download
                                  >
                                    <Download className="w-3.5 h-3.5 text-[#FF6B00]" />
                                    <span>Download Solution</span>
                                  </a>
                                </div>
                              </div>
                            )}

                            {/* Action Footer */}
                            <div className="pt-3 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
                              <button
                                type="button"
                                onClick={() => setActiveTab("NOTES")}
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#0B1B3D] text-white hover:bg-[#132752] transition-colors shadow-xs cursor-pointer"
                              >
                                <ArrowLeft className="w-3.5 h-3.5 text-[#FF6B00]" />
                                <span>Back to Course Lessons</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setAssignmentText(activeSubmission.textContent || "");
                                  setIsEditingSubmission(true);
                                }}
                                className="text-xs font-bold text-slate-500 hover:text-[#0B1B3D] cursor-pointer"
                              >
                                Update / Resubmit Solution
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* Submission Form */
                        <form
                          onSubmit={handleSubmitAssignment}
                          className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4"
                        >
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-[#0B1B3D]">
                              {isEditingSubmission ? "Update Your Submission" : "Submit Your Assignment"}
                            </h4>
                            {isEditingSubmission && (
                              <button
                                type="button"
                                onClick={() => setIsEditingSubmission(false)}
                                className="text-xs text-slate-400 hover:text-slate-600"
                              >
                                Cancel
                              </button>
                            )}
                          </div>

                          {assignmentStatus?.error && (
                            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
                              {assignmentStatus.error}
                            </div>
                          )}
                          {assignmentStatus?.success && (
                            <div className="p-4 bg-emerald-50 text-emerald-800 text-xs rounded-2xl border border-emerald-300 space-y-2">
                              <div className="font-bold flex items-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                <span>{assignmentStatus.success}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => setActiveTab("NOTES")}
                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#0B1B3D] text-white hover:bg-[#132752] transition-colors shadow-xs cursor-pointer mt-1"
                              >
                                <ArrowLeft className="w-3.5 h-3.5 text-[#FF6B00]" />
                                <span>Back to Course Lessons</span>
                              </button>
                            </div>
                          )}

                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700">
                              GitHub Repository URL / Solution Writeup
                            </label>
                            <textarea
                              rows={4}
                              value={assignmentText}
                              onChange={(e) => setAssignmentText(e.target.value)}
                              placeholder="Provide repository URL, deployed demo link, and architectural notes..."
                              className="w-full p-3.5 rounded-xl text-xs border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#FF6B00] leading-relaxed"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700">
                              Attach Project Archive (Optional, max 15MB: ZIP, PDF, Code)
                            </label>
                            <input
                              type="file"
                              onChange={(e) => setAssignmentFile(e.target.files?.[0] || null)}
                              className="w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#0B1B3D] file:text-white hover:file:bg-[#132752]"
                            />
                          </div>

                          <button
                            type="submit"
                            disabled={isPending}
                            className="w-full py-3 rounded-xl bg-[#FF6B00] hover:bg-[#EA580C] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                          >
                            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                            <span>Submit Solution for Faculty Grading</span>
                          </button>
                        </form>
                      )}
                    </div>
                  ) : (
                    <div className="p-8 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                      <FileCheck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-xs font-bold text-slate-600">No project assignments active for this course</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Curriculum assessments are evaluated via the modular assessment quiz.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 4: Discussion & Q&A */}
              {activeTab === "QA" && (
                <div className="p-6 sm:p-8 space-y-6">
                  <div className="border-b border-slate-100 pb-4">
                    <h3 className="text-sm font-bold text-[#0B1B3D]">
                      Lesson Discussion & Academic Inquiry
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Ask technical questions, get answers from your instructor, and discuss engineering patterns with peers.
                    </p>
                  </div>

                  {/* Ask Question Form */}
                  <form onSubmit={handlePostDiscussion} className="space-y-3">
                    {qaStatus?.error && (
                      <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
                        {qaStatus.error}
                      </div>
                    )}
                    {qaStatus?.success && (
                      <div className="p-3 bg-emerald-50 text-emerald-700 text-xs rounded-xl border border-emerald-200">
                        {qaStatus.success}
                      </div>
                    )}

                    <div className="relative">
                      <textarea
                        rows={3}
                        value={questionContent}
                        onChange={(e) => setQuestionContent(e.target.value)}
                        placeholder="Ask a question or share an insight about this lecture..."
                        maxLength={1500}
                        className="w-full p-3.5 pr-20 rounded-xl text-xs border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#FF6B00] leading-relaxed"
                        required
                      />
                      <span className="absolute right-3 bottom-3 text-[10px] text-slate-400 font-mono">
                        {questionContent.length}/1500
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      {isInstructor ? (
                        <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isAnswerPost}
                            onChange={(e) => setIsAnswerPost(e.target.checked)}
                            className="rounded text-[#FF6B00] focus:ring-[#FF6B00]"
                          />
                          <span>Pin as Official Instructor Answer</span>
                        </label>
                      ) : <div />}

                      <button
                        type="submit"
                        disabled={isPending || questionContent.trim().length < 3}
                        className="px-5 py-2 rounded-xl bg-[#0B1B3D] hover:bg-[#132752] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5 text-[#FF6B00]" />}
                        <span>Post Message</span>
                      </button>
                    </div>
                  </form>

                  {/* Discussion Thread */}
                  {currentLesson.discussions.length > 0 ? (
                    <div className="space-y-4 pt-2">
                      {currentLesson.discussions.map((msg) => {
                        const isAuthor = msg.user.id === user.id;
                        const isFaculty = msg.user.role === "TRAINER" || msg.user.role === "ADMIN";

                        return (
                          <div
                            key={msg.id}
                            className={`p-4 rounded-2xl border transition-all ${
                              msg.isAnswer
                                ? "bg-orange-50/40 border-orange-200/90 shadow-xs"
                                : "bg-white border-slate-200"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-full bg-[#0B1B3D] text-white text-xs font-bold flex items-center justify-center">
                                  {msg.user.name.charAt(0)}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-[#0B1B3D]">
                                      {msg.user.name}
                                    </span>
                                    {isFaculty && (
                                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#FF6B00] text-white">
                                        Faculty
                                      </span>
                                    )}
                                    {msg.isAnswer && (
                                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                                        Verified Answer
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[10px] text-slate-400">
                                    {formatDate(msg.createdAt)}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-1">
                                {!msg.reported ? (
                                  <button
                                    type="button"
                                    onClick={() => handleReportDiscussion(msg.id)}
                                    className="p-1.5 text-slate-400 hover:text-amber-600 transition-colors"
                                    title="Report to Moderator"
                                  >
                                    <Flag className="w-3.5 h-3.5" />
                                  </button>
                                ) : (
                                  <span className="text-[10px] text-amber-600 font-bold px-2 py-0.5 bg-amber-50 rounded">
                                    Reported
                                  </span>
                                )}

                                {(isAuthor || isInstructor) && (
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteDiscussion(msg.id)}
                                    className="p-1.5 text-slate-400 hover:text-red-600 transition-colors"
                                    title="Delete Message"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>

                            <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap pl-9">
                              {msg.content}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-8 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                      <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-xs font-bold text-slate-600">No questions posted yet</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Have a technical question regarding this lesson? Be the first to start the academic inquiry!
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Next/Prev Navigation */}
            <div className="flex items-center justify-between pt-2">
              {prevLesson ? (
                <Link
                  href={`/courses/${course.slug}/learn/${prevLesson.id}`}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
                >
                  <ArrowLeft className="w-4 h-4 text-slate-500" />
                  <span className="line-clamp-1">Prev: {prevLesson.title}</span>
                </Link>
              ) : <div />}

              {nextLesson ? (
                <Link
                  href={`/courses/${course.slug}/learn/${nextLesson.id}`}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#0B1B3D] text-white hover:bg-[#132752] transition-colors shadow-xs"
                >
                  <span className="line-clamp-1">Next: {nextLesson.title}</span>
                  <ArrowRight className="w-4 h-4 text-[#FF6B00]" />
                </Link>
              ) : course.quizzes.length > 0 ? (
                <Link
                  href={`/courses/${course.slug}/quiz/${course.quizzes[0].id}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#FF6B00] text-white hover:bg-[#EA580C] shadow-md transition-all"
                >
                  <HelpCircle className="w-4 h-4" />
                  <span>Take Assessment Quiz</span>
                </Link>
              ) : null}
            </div>
          </div>

          {/* Right Column: Module Syllabus Playlist (4 cols) */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden sticky top-24">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="font-bold text-xs text-[#0B1B3D] flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#FF6B00]" />
                <span>Course Curriculum</span>
              </div>
              <span className="text-[11px] font-semibold text-slate-500 font-mono">
                {allLessons.length} Total Lessons
              </span>
            </div>

            <div className="max-h-[640px] overflow-y-auto divide-y divide-slate-100">
              {course.sections.map((sec, sIdx) => {
                const isCollapsed = collapsedSections[sec.id] || false;
                const completedInSec = sec.lessons.filter((l) => completedLessonIds.includes(l.id)).length;

                return (
                  <div key={sec.id} className="p-3">
                    <button
                      type="button"
                      onClick={() => toggleSection(sec.id)}
                      className="w-full text-xs font-bold text-slate-800 mb-2 px-2 flex items-center justify-between hover:text-[#FF6B00] transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-[#0B1B3D] text-white text-[10px] flex items-center justify-center font-bold">
                          {sIdx + 1}
                        </span>
                        <span className="line-clamp-1 text-left">{sec.title}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] font-mono text-slate-400">
                          {completedInSec}/{sec.lessons.length}
                        </span>
                        {isCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
                      </div>
                    </button>

                    {!isCollapsed && (
                      <div className="space-y-1">
                        {sec.lessons.map((les) => {
                          const isCompleted = completedLessonIds.includes(les.id);
                          const isCurrent = les.id === currentLesson.id;

                          return (
                            <Link
                              key={les.id}
                              href={`/courses/${course.slug}/learn/${les.id}`}
                              className={`flex items-center justify-between p-2.5 rounded-xl text-xs transition-colors ${
                                isCurrent
                                  ? "bg-orange-50 border border-orange-200 font-bold text-[#FF6B00]"
                                  : "hover:bg-slate-50 text-slate-600 font-medium"
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                {isCompleted ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                ) : (
                                  <Circle className="w-4 h-4 text-slate-300 shrink-0" />
                                )}
                                <span className="truncate">{les.title}</span>
                              </div>
                              <span className="text-[10px] text-slate-400 font-mono shrink-0 ml-2">
                                {les.duration}
                              </span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Assessment Quiz Link in Playlist */}
              {course.quizzes.length > 0 && (
                <div className="p-3 bg-orange-50/40 border-t border-slate-100">
                  {course.quizzes.map((quiz) => (
                    <Link
                      key={quiz.id}
                      href={`/courses/${course.slug}/quiz/${quiz.id}`}
                      className="flex items-center justify-between p-3 rounded-xl bg-white border border-orange-200 text-xs font-bold text-[#0B1B3D] hover:border-[#FF6B00] transition-colors shadow-xs"
                    >
                      <div className="flex items-center gap-2 text-[#FF6B00] min-w-0">
                        <HelpCircle className="w-4 h-4 shrink-0" />
                        <span className="truncate">{quiz.title}</span>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded shrink-0 ml-2 ${
                          quiz.isPassed
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                            : quiz.attemptCount && quiz.attemptCount > 0
                            ? "bg-red-100 text-red-800 border border-red-300"
                            : "bg-orange-100 text-orange-700"
                        }`}
                      >
                        {quiz.isPassed
                          ? `Passed (${quiz.bestScore}%) ✓`
                          : quiz.attemptCount && quiz.attemptCount > 0
                          ? `Retake (${quiz.bestScore}%)`
                          : "Assessment Quiz"}
                      </span>
                    </Link>
                  ))}
                </div>
              )}

              {/* Capstone Practical Assignment Link in Playlist */}
              {course.assignments.length > 0 && (
                <div className="p-3 bg-slate-50/70 border-t border-slate-100">
                  {course.assignments.map((assign) => {
                    const sub =
                      assign.id === currentAssignment?.id && activeSubmission
                        ? activeSubmission
                        : assign.mySubmission;
                    const isPassed =
                      sub?.status === "GRADED" &&
                      sub.score !== null &&
                      sub.score / assign.maxScore >= 0.7;
                    const isFailed =
                      sub?.status === "GRADED" &&
                      sub.score !== null &&
                      sub.score / assign.maxScore < 0.7;
                    const isPendingReview = sub?.status === "SUBMITTED";
                    const isRevision = sub?.status === "RESUBMIT_REQUESTED";

                    return (
                      <button
                        key={assign.id}
                        type="button"
                        onClick={() => {
                          setActiveTab("ASSIGNMENT");
                          window.scrollTo({ top: 400, behavior: "smooth" });
                        }}
                        className="w-full text-left p-3 rounded-xl bg-white border border-slate-200 hover:border-[#FF6B00] transition-colors shadow-xs flex items-center justify-between gap-2 cursor-pointer"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <FileCheck className="w-4 h-4 text-[#FF6B00] shrink-0" />
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-[#0B1B3D] block truncate">
                              {assign.title}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              Practical Capstone Project
                            </span>
                          </div>
                        </div>

                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider shrink-0 ${
                            isPassed
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                              : isFailed
                              ? "bg-red-100 text-red-800 border border-red-300"
                              : isPendingReview
                              ? "bg-blue-100 text-blue-800 border border-blue-300"
                              : isRevision
                              ? "bg-amber-100 text-amber-800 border border-amber-300"
                              : "bg-slate-100 text-slate-600 border border-slate-200"
                          }`}
                        >
                          {isPassed
                            ? `Cleared (${sub?.score} Pts) ✓`
                            : isFailed
                            ? "Needs Revision ✗"
                            : isPendingReview
                            ? "Under Review ⏳"
                            : isRevision
                            ? "Resubmit ⚠️"
                            : "Submit Solution"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Course Clearance & Verified Credential Milestone Card */}
            <div className="p-4 bg-gradient-to-b from-slate-900 via-[#0B1B3D] to-slate-950 text-white border-t border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                    Credential Clearance
                  </span>
                </div>
                <span
                  className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                    currentCertificateCode
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/40"
                      : isEverythingCleared
                      ? "bg-amber-400 text-slate-950 font-bold"
                      : "bg-slate-800 text-slate-400 border border-slate-700"
                  }`}
                >
                  {currentCertificateCode
                    ? "ISSUED ✓"
                    : isEverythingCleared
                    ? "READY TO CLAIM 🎓"
                    : "IN PROGRESS"}
                </span>
              </div>

              {/* Clearance Checklist */}
              <div className="space-y-2 text-[11px] bg-white/5 p-3 rounded-xl border border-white/10">
                {/* 1. Lessons */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-300">
                    {isLessonsComplete ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    ) : (
                      <Circle className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    )}
                    <span>100% Course Lectures Completed</span>
                  </div>
                  <span
                    className={`font-mono text-[10px] ${
                      isLessonsComplete ? "text-emerald-400 font-bold" : "text-slate-400"
                    }`}
                  >
                    {completedLessonsCount}/{totalLessons}
                  </span>
                </div>

                {/* 2. Quizzes */}
                {hasQuizzes && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-300">
                      {isQuizzesCleared ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      ) : (
                        <Circle className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      )}
                      <span>Assessment Quiz Passed</span>
                    </div>
                    <span
                      className={`font-mono text-[10px] ${
                        isQuizzesCleared ? "text-emerald-400 font-bold" : "text-amber-400"
                      }`}
                    >
                      {isQuizzesCleared ? "Cleared ✓" : "Pending ⏳"}
                    </span>
                  </div>
                )}

                {/* 3. Assignments */}
                {hasAssignments && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-300">
                      {isAssignmentsCleared ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      ) : (
                        <Circle className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      )}
                      <span>Capstone Project Approved</span>
                    </div>
                    <span
                      className={`font-mono text-[10px] ${
                        isAssignmentsCleared ? "text-emerald-400 font-bold" : "text-amber-400"
                      }`}
                    >
                      {isAssignmentsCleared ? "Cleared ✓" : "Pending ⏳"}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Area */}
              {currentCertificateCode ? (
                <Link
                  href={`/verify?code=${encodeURIComponent(currentCertificateCode)}`}
                  className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 text-xs font-extrabold flex items-center justify-center gap-2 shadow-md hover:from-amber-300 hover:to-amber-400 transition-all cursor-pointer"
                >
                  <Award className="w-4 h-4 text-slate-900" />
                  <span>View Verified Certificate 🎓</span>
                </Link>
              ) : isEverythingCleared ? (
                <button
                  type="button"
                  onClick={handleClaimCertificate}
                  disabled={isClaimingCert}
                  className="w-full py-2.5 px-3 rounded-xl bg-[#FF6B00] hover:bg-[#EA580C] text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {isClaimingCert ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  <span>Claim Verified Certificate 🎓</span>
                </button>
              ) : (
                <div className="text-[10px] text-slate-400 text-center flex items-center justify-center gap-1.5 py-1">
                  <Lock className="w-3 h-3 text-slate-500" />
                  <span>Clear all items above to unlock official credential.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
