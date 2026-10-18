"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { 
  CheckCircle2, 
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
  AlertCircle,
  Sparkles,
  Paperclip,
  ExternalLink,
  FileCheck,
  ChevronDown,
  ChevronUp,
  Loader2,
  FolderArchive
} from "lucide-react";
import { toggleLessonProgress } from "@/app/actions/learning";
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

export interface ClassroomPlayerProps {
  course: {
    id: string;
    title: string;
    slug: string;
    category: { name: string };
    instructor: { id: string; name: string };
    sections: SerializedSection[];
    quizzes: { id: string; title: string }[];
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
  const [assignmentText, setAssignmentText] = useState("");
  const [assignmentFile, setAssignmentFile] = useState<File | null>(null);
  const [assignmentStatus, setAssignmentStatus] = useState<{ error?: string; success?: string } | null>(null);
  const [isEditingSubmission, setIsEditingSubmission] = useState(false);

  // Q&A state
  const [questionContent, setQuestionContent] = useState("");
  const [isAnswerPost, setIsAnswerPost] = useState(false);
  const [qaStatus, setQaStatus] = useState<{ error?: string; success?: string } | null>(null);

  // Flattened lessons list
  const allLessons = course.sections.flatMap((s) => s.lessons);
  const currentLessonIndex = allLessons.findIndex((l) => l.id === currentLesson.id);
  const prevLesson = currentLessonIndex > 0 ? allLessons[currentLessonIndex - 1] : null;
  const nextLesson = currentLessonIndex < allLessons.length - 1 ? allLessons[currentLessonIndex + 1] : null;

  const isCurrentCompleted = completedLessonIds.includes(currentLesson.id);
  const currentAssignment = course.assignments[0] || null;

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
        await submitAssignmentAction(formData);
        setAssignmentStatus({ success: "Your project solution has been submitted for evaluation!" });
        setIsEditingSubmission(false);
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

      {/* Certificate Notice Banner */}
      {certificateCode && (
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white py-2.5 px-4 shadow-inner">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-300 shrink-0" />
              <span>
                <strong>Academic Milestone Achieved!</strong> Official credential issued with ID: <code className="bg-emerald-900/40 px-1.5 py-0.5 rounded font-mono font-bold text-amber-200">{certificateCode}</code>
              </span>
            </div>
            <Link
              href={`/verify?code=${certificateCode}`}
              className="px-3 py-1 bg-white text-emerald-800 font-bold rounded-lg hover:bg-emerald-50 transition-colors shadow-xs"
            >
              View Verified Credential
            </Link>
          </div>
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
                    {currentAssignment?.mySubmission && (
                      <span className="ml-1.5 w-2 h-2 rounded-full bg-emerald-500 inline-block" />
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
                      {currentAssignment.mySubmission && !isEditingSubmission ? (
                        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                              <span className="text-xs font-bold text-[#0B1B3D]">Your Active Submission</span>
                            </div>
                            <span
                              className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                                currentAssignment.mySubmission.status === "GRADED"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : currentAssignment.mySubmission.status === "RESUBMIT_REQUESTED"
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {currentAssignment.mySubmission.status}
                            </span>
                          </div>

                          {/* Graded Feedback Box if Graded */}
                          {currentAssignment.mySubmission.score !== null && (
                            <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-emerald-900">
                                  Evaluation Grade: {currentAssignment.mySubmission.score} / {currentAssignment.maxScore}
                                </span>
                                <span className="text-[10px] text-emerald-700">
                                  Evaluated on {currentAssignment.mySubmission.gradedAt ? formatDate(currentAssignment.mySubmission.gradedAt) : "Recently"}
                                </span>
                              </div>
                              {currentAssignment.mySubmission.feedback && (
                                <p className="text-xs text-emerald-800 leading-relaxed">
                                  <strong>Faculty Feedback:</strong> {currentAssignment.mySubmission.feedback}
                                </p>
                              )}
                            </div>
                          )}

                          {/* Student Submission Text */}
                          {currentAssignment.mySubmission.textContent && (
                            <div className="text-xs text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100 font-mono whitespace-pre-wrap">
                              {currentAssignment.mySubmission.textContent}
                            </div>
                          )}

                          {/* Attached File */}
                          {currentAssignment.mySubmission.fileUrl && (
                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                              <div className="flex items-center gap-2">
                                <Paperclip className="w-4 h-4 text-slate-400" />
                                <span className="font-semibold text-slate-700">
                                  {currentAssignment.mySubmission.fileName || "Submitted_Project_Archive.zip"}
                                </span>
                                {currentAssignment.mySubmission.fileSize && (
                                  <span className="text-[11px] text-slate-400">
                                    ({formatBytes(currentAssignment.mySubmission.fileSize)})
                                  </span>
                                )}
                              </div>
                              <a
                                href={`/api/courses/${course.slug}/assignments/${currentAssignment.mySubmission.id}/download`}
                                className="text-xs font-bold text-[#FF6B00] hover:underline"
                                download
                              >
                                Download Solution
                              </a>
                            </div>
                          )}

                          <div className="pt-2 flex justify-end">
                            <button
                              type="button"
                              onClick={() => {
                                setAssignmentText(currentAssignment.mySubmission?.textContent || "");
                                setIsEditingSubmission(true);
                              }}
                              className="text-xs font-bold text-slate-500 hover:text-[#0B1B3D]"
                            >
                              Update / Resubmit Solution
                            </button>
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
                            <div className="p-3 bg-emerald-50 text-emerald-700 text-xs rounded-xl border border-emerald-200">
                              {assignmentStatus.success}
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
                <div className="p-4 bg-orange-50/40">
                  <Link
                    href={`/courses/${course.slug}/quiz/${course.quizzes[0].id}`}
                    className="flex items-center justify-between p-3 rounded-xl bg-white border border-orange-200 text-xs font-bold text-[#0B1B3D] hover:border-[#FF6B00] transition-colors shadow-xs"
                  >
                    <div className="flex items-center gap-2 text-[#FF6B00]">
                      <HelpCircle className="w-4 h-4" />
                      <span className="line-clamp-1">{course.quizzes[0].title}</span>
                    </div>
                    <span className="text-[10px] font-semibold text-orange-600 bg-orange-100 px-2 py-0.5 rounded shrink-0 ml-2">
                      Assessment
                    </span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
