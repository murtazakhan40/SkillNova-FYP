"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  CheckCircle2, 
  XCircle, 
  ArrowLeft, 
  ArrowRight, 
  RotateCcw,
  Sparkles,
  BookOpen,
  HelpCircle,
  History
} from "lucide-react";
import { submitQuizAttempt } from "@/app/actions/learning";
import { formatDate } from "@/lib/utils";

interface QuestionItem {
  id: string;
  text: string;
  options: string[];
  explanation?: string | null;
}

interface QuestionResultItem {
  questionId: string;
  selectedOption: number | null;
  correctOption: number;
  isCorrect: boolean;
  explanation: string | null;
}

interface PreviousAttempt {
  id: string;
  score: number;
  passed: boolean;
  createdAt: string;
}

interface QuizClientProps {
  quiz: {
    id: string;
    title: string;
    passingScore: number;
    course: {
      slug: string;
      title: string;
    };
  };
  questions: QuestionItem[];
  isEnrolled?: boolean;
  returnUrl?: string;
  previousAttempts?: PreviousAttempt[];
}

export function QuizClient({
  quiz,
  questions,
  isEnrolled = false,
  returnUrl = `/courses/${quiz.course.slug}`,
  previousAttempts = [],
}: QuizClientProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    score: number;
    passed: boolean;
    passingScore: number;
    correctCount: number;
    totalQuestions: number;
    questionResults?: QuestionResultItem[];
  } | null>(null);

  const answeredCount = Object.keys(selectedAnswers).length;
  const progressPercent = Math.round((answeredCount / questions.length) * 100);

  const handleSelect = (questionId: string, optionIndex: number) => {
    if (result) return; // Locked once evaluated
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleSubmit = async () => {
    if (answeredCount < questions.length) {
      alert(`Please answer all ${questions.length} questions before submitting (currently answered ${answeredCount}/${questions.length}).`);
      return;
    }

    setSubmitting(true);
    try {
      const res = await submitQuizAttempt(quiz.id, selectedAnswers);
      setResult(res);
      // Smoothly scroll to the top of the evaluation banner
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      alert("Failed to submit assignment assessment. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetake = () => {
    setSelectedAnswers({});
    setResult(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Map question results for instant lookup
  const resultMap = React.useMemo(() => {
    if (!result?.questionResults) return new Map<string, QuestionResultItem>();
    return new Map(result.questionResults.map((r) => [r.questionId, r]));
  }, [result]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* =========================================================================
          1. TOP NAVIGATION & BACK TO COURSE BUTTON
          ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
        <Link
          href={returnUrl}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-heading font-bold bg-[#0B1B3D] text-white hover:bg-[#132752] transition-all shadow-sm group w-fit cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-[#FF6B00] group-hover:-translate-x-1 transition-transform" />
          <span>{isEnrolled ? "Back to Enrolled Course" : "Back to Course"}</span>
        </Link>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <BookOpen className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="font-semibold text-slate-700 truncate max-w-xs">
            {quiz.course.title}
          </span>
          {isEnrolled && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
              Enrolled Student
            </span>
          )}
        </div>
      </div>

      {/* =========================================================================
          2. ASSESSMENT HEADER CARD WITH PASSING CRITERIA
          ========================================================================= */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-orange-50 text-[#FF6B00] border border-orange-200">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Course Assessment & Questions</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#0B1B3D]">
              {quiz.title}
            </h1>
            <p className="text-xs text-slate-500">
              Answer all questions below. Passing benchmark: <strong className="text-slate-800">{quiz.passingScore}%</strong>.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {result ? (
              <div
                className={`px-4 py-2.5 rounded-2xl text-xs font-heading font-extrabold border shadow-sm flex items-center gap-2 ${
                  result.passed
                    ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                    : "bg-red-50 text-red-800 border-red-300"
                }`}
              >
                {result.passed ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>PASSED ({result.score}%)</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-red-600" />
                    <span>FAILED ({result.score}%)</span>
                  </>
                )}
              </div>
            ) : (
              <div className="text-right">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Questions
                </span>
                <span className="text-lg font-extrabold text-[#0B1B3D]">
                  {answeredCount} / {questions.length}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Progress Bar before submission */}
        {!result && (
          <div className="mt-6 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
              <span>Completion Progress</span>
              <span>{progressPercent}% Complete</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#FF6B00] to-amber-400 transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          3. RESULT BANNER: PROMINENT PASS / FAIL EVALUATION CARD
          ========================================================================= */}
      {result && (
        <div
          className={`p-6 sm:p-8 rounded-3xl border-2 shadow-lg transition-all ${
            result.passed
              ? "bg-gradient-to-br from-emerald-50 via-white to-emerald-50/40 border-emerald-500/40 text-emerald-950"
              : "bg-gradient-to-br from-red-50 via-white to-red-50/40 border-red-500/40 text-red-950"
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-md ${
                  result.passed
                    ? "bg-emerald-600 text-white"
                    : "bg-red-600 text-white"
                }`}
              >
                {result.passed ? (
                  <CheckCircle2 className="w-8 h-8" />
                ) : (
                  <XCircle className="w-8 h-8" />
                )}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                      result.passed
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                        : "bg-red-100 text-red-800 border border-red-300"
                    }`}
                  >
                    STATUS: {result.passed ? "PASSED (PASS)" : "FAILED (FAIL)"}
                  </span>
                  <span className="text-xs text-slate-500 font-semibold">
                    Score: {result.score}%
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl font-heading font-extrabold tracking-tight">
                  {result.passed
                    ? "Congratulations! You Passed the Assessment"
                    : "Assessment Not Passed (Failed)"}
                </h2>

                <p className="text-xs text-slate-600 leading-relaxed max-w-xl">
                  {result.passed
                    ? `You correctly answered ${result.correctCount} of ${result.totalQuestions} questions (${result.score}%). Your score meets the required ${result.passingScore}% passing standard.`
                    : `You scored ${result.score}% by answering ${result.correctCount} of ${result.totalQuestions} questions correctly. The required passing score is ${result.passingScore}%. Review your questions below and retake when ready.`}
                </p>
              </div>
            </div>

            {/* Action Buttons: Back to Course & Retake */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link
                href={returnUrl}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-heading font-bold bg-[#0B1B3D] text-white hover:bg-[#132752] transition-colors shadow-md btn-lift cursor-pointer"
              >
                <span>{isEnrolled ? "Back to Enrolled Course" : "Back to Course"}</span>
                <ArrowRight className="w-4 h-4 text-[#FF6B00]" />
              </Link>

              <button
                type="button"
                onClick={handleRetake}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-heading font-bold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 text-slate-500" />
                <span>Retake Assessment</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          4. QUESTIONS LIST WITH PASS / FAIL PER QUESTION BREAKDOWN
          ========================================================================= */}
      <div className="space-y-6">
        {questions.map((q, qIndex) => {
          const qResult = resultMap.get(q.id);
          const studentPicked = selectedAnswers[q.id];

          return (
            <div
              key={q.id}
              className={`bg-white p-6 sm:p-7 rounded-3xl border-2 transition-all shadow-xs ${
                result
                  ? qResult?.isCorrect
                    ? "border-emerald-300 bg-emerald-50/10"
                    : "border-red-300 bg-red-50/10"
                  : "border-slate-200/90"
              }`}
            >
              {/* Question Header & Pass/Fail Badge */}
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-start gap-3">
                  <span
                    className={`w-7 h-7 rounded-xl text-xs font-heading font-bold flex items-center justify-center shrink-0 ${
                      result
                        ? qResult?.isCorrect
                          ? "bg-emerald-600 text-white"
                          : "bg-red-600 text-white"
                        : "bg-[#0B1B3D] text-white"
                    }`}
                  >
                    {qIndex + 1}
                  </span>
                  <h3 className="text-sm font-heading font-bold text-[#0B1B3D] pt-0.5 leading-snug">
                    {q.text}
                  </h3>
                </div>

                {/* Per-Question Pass/Fail Badge if evaluated */}
                {result && qResult && (
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider shrink-0 flex items-center gap-1 ${
                      qResult.isCorrect
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                        : "bg-red-100 text-red-800 border border-red-300"
                    }`}
                  >
                    {qResult.isCorrect ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>PASS (Correct)</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3.5 h-3.5 text-red-600" />
                        <span>FAIL (Incorrect)</span>
                      </>
                    )}
                  </span>
                )}
              </div>

              {/* Options */}
              <div className="space-y-2.5 pl-0 sm:pl-10">
                {q.options.map((option, optIndex) => {
                  const isSelected = studentPicked === optIndex;
                  const isEvaluated = Boolean(result && qResult);
                  const isCorrectOption = isEvaluated && qResult?.correctOption === optIndex;
                  const isWrongChoice = isEvaluated && isSelected && !qResult?.isCorrect;

                  let optionStyle = "border-slate-200 hover:bg-slate-50 text-slate-700";

                  if (isEvaluated) {
                    if (isCorrectOption) {
                      optionStyle = "border-emerald-500 bg-emerald-50 text-emerald-950 font-bold shadow-xs";
                    } else if (isWrongChoice) {
                      optionStyle = "border-red-500 bg-red-50 text-red-950 font-bold shadow-xs";
                    } else {
                      optionStyle = "border-slate-200 text-slate-400 opacity-60";
                    }
                  } else if (isSelected) {
                    optionStyle = "border-[#FF6B00] bg-orange-50/60 font-semibold text-[#0B1B3D] shadow-xs";
                  }

                  return (
                    <label
                      key={optIndex}
                      onClick={() => handleSelect(q.id, optIndex)}
                      className={`flex items-center justify-between p-3.5 rounded-xl border text-xs transition-all ${optionStyle} ${
                        isEvaluated ? "cursor-default" : "cursor-pointer"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name={`question_${q.id}`}
                          checked={isSelected}
                          onChange={() => handleSelect(q.id, optIndex)}
                          disabled={isEvaluated}
                          className="accent-[#FF6B00] shrink-0"
                        />
                        <span>{option}</span>
                      </div>

                      {/* Result Tag next to option */}
                      {isEvaluated && (
                        <div className="shrink-0 text-[10px] font-bold">
                          {isCorrectOption && (
                            <span className="text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Correct Answer
                            </span>
                          )}
                          {isWrongChoice && (
                            <span className="text-red-700 bg-red-100/80 px-2 py-0.5 rounded flex items-center gap-1">
                              <XCircle className="w-3 h-3 text-red-600" />
                              Your Choice (Wrong)
                            </span>
                          )}
                        </div>
                      )}
                    </label>
                  );
                })}
              </div>

              {/* Technical Explanation when evaluated */}
              {result && (qResult?.explanation || q.explanation) && (
                <div className="mt-4 sm:ml-10 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-slate-900">
                    <HelpCircle className="w-3.5 h-3.5 text-[#FF6B00]" />
                    <span>Academic Explanation & Rationale:</span>
                  </div>
                  <p className="leading-relaxed pl-5 text-slate-600">
                    {qResult?.explanation || q.explanation}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* =========================================================================
          5. BOTTOM ACTION FOOTER
          ========================================================================= */}
      {result ? (
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Assessment Outcome
            </span>
            <div className="text-base font-extrabold text-[#0B1B3D] flex items-center gap-2 mt-0.5">
              <span>Final Grade: {result.score}%</span>
              <span
                className={`px-2 py-0.5 rounded text-xs ${
                  result.passed
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {result.passed ? "PASSED" : "FAILED"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={returnUrl}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-heading font-bold bg-[#0B1B3D] text-white hover:bg-[#132752] transition-colors shadow-md btn-lift cursor-pointer"
            >
              <span>{isEnrolled ? "Back to Enrolled Course" : "Back to Course"}</span>
              <ArrowRight className="w-4 h-4 text-[#FF6B00]" />
            </Link>

            <button
              type="button"
              onClick={handleRetake}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-heading font-bold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 text-slate-500" />
              <span>Retake</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
          <Link
            href={returnUrl}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-heading font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors shadow-xs cursor-pointer w-fit"
          >
            <ArrowLeft className="w-4 h-4 text-[#FF6B00]" />
            <span>Cancel & Back to Course</span>
          </Link>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-heading font-bold text-xs text-white bg-[#FF6B00] hover:bg-[#EA580C] shadow-lg shadow-orange-500/25 transition-all hover:scale-105 disabled:opacity-50 cursor-pointer"
          >
            {submitting ? (
              <>
                <RotateCcw className="w-4 h-4 animate-spin" />
                <span>Evaluating Submission...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Submit Assessment ({answeredCount}/{questions.length} Answered)</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* =========================================================================
          6. PREVIOUS ATTEMPTS AUDIT LOG
          ========================================================================= */}
      {previousAttempts.length > 0 && (
        <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <History className="w-4 h-4 text-slate-400" />
            <span>Your Previous Attempts for this Assessment</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {previousAttempts.map((att, idx) => (
              <div
                key={att.id || idx}
                className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-extrabold text-slate-900">{att.score}%</span>
                  <div className="text-[10px] text-slate-400">
                    {formatDate(att.createdAt)}
                  </div>
                </div>

                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                    att.passed
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}
                >
                  {att.passed ? "PASS" : "FAIL"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
