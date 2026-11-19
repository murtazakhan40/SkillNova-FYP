"use client";

import React, { useState, useTransition } from "react";
import { 
  Users, 
  Send, 
  Mail, 
  Phone, 
  CheckCircle2, 
  Sparkles, 
  Award, 
  BookOpen, 
  Eye, 
  X, 
  Loader2, 
  Heart,
  AlertCircle
} from "lucide-react";
import { dispatchStudentParentReportAction } from "@/app/actions/parent-report";
import { StudentAcademicReportData } from "@/lib/parent-reports";

interface ParentReportCardProps {
  student: {
    id: string;
    name: string;
    email: string;
    age?: number | null;
    parentName?: string | null;
    parentEmail?: string | null;
    parentPhone?: string | null;
    parentRelationship?: string | null;
  };
  course?: {
    id: string;
    title: string;
    slug: string;
    progress: number;
  };
}

export function ParentReportCard({ student, course }: ParentReportCardProps) {
  const [isPending, startTransition] = useTransition();
  const [customNote, setCustomNote] = useState("");
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewReport, setPreviewReport] = useState<StudentAcademicReportData | null>(null);

  const isMinor = Boolean(student.age !== null && student.age !== undefined && student.age < 18);
  const hasParentDetails = Boolean(student.parentEmail);

  const handleSendReport = () => {
    if (!student.parentEmail) {
      setStatusMessage({
        type: "error",
        text: "Please add your parent/guardian email in your profile first.",
      });
      return;
    }

    setStatusMessage(null);
    startTransition(async () => {
      try {
        const result = await dispatchStudentParentReportAction(course?.id, customNote);
        if (result.success) {
          setStatusMessage({
            type: "success",
            text: result.message || `Report delivered to ${student.parentEmail}!`,
          });
          if (result.reportData) {
            setPreviewReport(result.reportData);
          }
          setCustomNote("");
        } else {
          setStatusMessage({
            type: "error",
            text: result.message || "Failed to send report.",
          });
        }
      } catch (err: unknown) {
        setStatusMessage({
          type: "error",
          text: err instanceof Error ? err.message : "Network error. Please try again.",
        });
      }
    });
  };

  return (
    <div className="p-6 rounded-3xl bg-gradient-to-br from-white via-orange-50/30 to-amber-50/40 border-2 border-orange-200/90 shadow-sm space-y-5">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#FF6B00] text-white flex items-center justify-center shadow-md shadow-orange-500/20 shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold text-[#0B1B3D]">
                Parent & Guardian Academic Reports
              </h3>
              {isMinor && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-300">
                  🌟 Junior Scholar (Age {student.age})
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Keep your parents updated with your progress, quiz grades, and certificates.
            </p>
          </div>
        </div>

        {hasParentDetails && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 w-fit">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Automatic Reports Active</span>
          </span>
        )}
      </div>

      {/* Parent details summary card */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="space-y-0.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Parent / Guardian
          </span>
          <div className="font-extrabold text-slate-800 flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-red-400" />
            <span>{student.parentName || "Not set yet"}</span>
            {student.parentRelationship && (
              <span className="text-[10px] font-normal text-slate-400">
                ({student.parentRelationship})
              </span>
            )}
          </div>
        </div>

        <div className="space-y-0.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Parent Email
          </span>
          <div className="font-semibold text-slate-800 flex items-center gap-1.5 truncate">
            <Mail className="w-3.5 h-3.5 text-[#FF6B00]" />
            <span className="truncate">{student.parentEmail || "No email registered"}</span>
          </div>
        </div>

        <div className="space-y-0.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            WhatsApp / Mobile
          </span>
          <div className="font-mono font-semibold text-slate-800 flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-emerald-600" />
            <span>{student.parentPhone || "No number"}</span>
          </div>
        </div>
      </div>

      {statusMessage && (
        <div
          className={`p-3.5 rounded-2xl text-xs flex items-start gap-2.5 animate-in fade-in duration-200 ${
            statusMessage.type === "success"
              ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
              : "bg-red-50 border border-red-200 text-red-800"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          )}
          <span className="font-medium">{statusMessage.text}</span>
        </div>
      )}

      {/* Note input & Send button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <input
          type="text"
          value={customNote}
          onChange={(e) => setCustomNote(e.target.value)}
          placeholder="Optional cheerful message: e.g. 'Hey Mom, I finished my lesson today!' 😊"
          disabled={isPending || !hasParentDetails}
          className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs bg-white text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00]"
        />

        <button
          type="button"
          onClick={handleSendReport}
          disabled={isPending || !hasParentDetails}
          className="px-5 py-2.5 rounded-xl text-xs font-heading font-extrabold bg-[#FF6B00] hover:bg-[#EA580C] text-white shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Sending Report...</span>
            </>
          ) : (
            <>
              <Send className="w-3.5 h-3.5" />
              <span>Send Report to Mom/Dad 🚀</span>
            </>
          )}
        </button>
      </div>

      {/* Preview Trigger */}
      {previewReport && (
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={() => setShowPreview(true)}
            className="text-xs font-bold text-[#0B1B3D] hover:text-[#FF6B00] inline-flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>View Sent Report Card Preview</span>
          </button>
        </div>
      )}

      {/* Preview Report Modal */}
      {showPreview && previewReport && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setShowPreview(false)}
        >
          <div
            className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-[#0B1B3D] text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h4 className="text-sm font-extrabold">Official Parent Academic Report Card</h4>
              </div>
              <button
                type="button"
                onClick={() => setShowPreview(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs text-slate-700 max-h-[80vh] overflow-y-auto">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm text-[#0B1B3D]">{previewReport.student.name}</span>
                  <span className="font-bold text-[11px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    Age {previewReport.student.age} • Junior Scholar
                  </span>
                </div>
                <div className="text-[11px] text-slate-500">
                  Recipient: {previewReport.student.parentName} ({previewReport.student.parentEmail})
                </div>
                <div className="text-[11px] text-slate-500 font-medium">
                  Standing: <strong className="text-emerald-700">{previewReport.academicStanding}</strong>
                </div>
              </div>

              {previewReport.course && (
                <div className="space-y-3">
                  <h5 className="font-bold text-[#0B1B3D] flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-[#FF6B00]" />
                    <span>Curriculum Progress: {previewReport.course.title}</span>
                  </h5>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span>Lectures Completed</span>
                      <span>{previewReport.course.completedLessons} / {previewReport.course.totalLessons} ({previewReport.course.progressPercent}%)</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-2.5 rounded-full"
                        style={{ width: `${previewReport.course.progressPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Quizzes */}
                  {previewReport.course.quizzes.length > 0 && (
                    <div className="space-y-1.5 pt-2">
                      <span className="text-[10px] font-bold uppercase text-slate-400">Assessments</span>
                      {previewReport.course.quizzes.map((q, idx) => (
                        <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                          <span>{q.title}</span>
                          <span className={`font-bold ${q.passed ? "text-emerald-600" : "text-amber-600"}`}>
                            {q.score !== null ? `${q.score}% (${q.passed ? "Passed" : "Retake"})` : "Not attempted"}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Certificate */}
                  {previewReport.course.certificate && (
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-3">
                      <Award className="w-5 h-5 text-amber-500 shrink-0" />
                      <div>
                        <strong className="block font-bold text-amber-900">Official Certificate Earned! 🎓</strong>
                        <span className="font-mono text-[10px] text-amber-700">{previewReport.course.certificate.code}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Recommendations */}
              {previewReport.recommendations.length > 0 && (
                <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 space-y-1">
                  <span className="font-bold text-blue-900 block text-[11px]">Instructor Recommendation for Parents:</span>
                  <ul className="list-disc list-inside text-[11px] text-blue-800 space-y-0.5">
                    {previewReport.recommendations.map((rec, i) => (
                      <li key={i}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
