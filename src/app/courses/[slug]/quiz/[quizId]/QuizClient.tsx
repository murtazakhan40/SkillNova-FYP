"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  RotateCcw,
  Sparkles
} from "lucide-react";
import { submitQuizAttempt } from "@/app/actions/learning";

interface QuestionItem {
  id: string;
  text: string;
  options: string[];
  explanation?: string | null;
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
}

export function QuizClient({ quiz, questions }: QuizClientProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    score: number;
    passed: boolean;
    passingScore: number;
    correctCount: number;
    totalQuestions: number;
  } | null>(null);

  const handleSelect = (questionId: string, optionIndex: number) => {
    if (result) return; // Prevent changing after submission
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleSubmit = async () => {
    if (Object.keys(selectedAnswers).length < questions.length) {
      alert("Please answer all questions before submitting.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await submitQuizAttempt(quiz.id, selectedAnswers);
      setResult(res);
    } catch {
      alert("Failed to submit quiz. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetake = () => {
    setSelectedAnswers({});
    setResult(null);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Quiz Header Card */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#FF6B00]">
            Course Assessment
          </span>
          <h1 className="text-2xl font-extrabold text-[#0B1B3D] mt-1">
            {quiz.title}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {questions.length} Questions • Passing benchmark: {quiz.passingScore}%
          </p>
        </div>

        {result && (
          <div className="flex items-center gap-3">
            <span
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${
                result.passed
                  ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                  : "bg-red-50 text-red-700 border-red-300"
              }`}
            >
              {result.passed ? "Passed ✓" : "Needs Improvement"} ({result.score}%)
            </span>
          </div>
        )}
      </div>

      {/* Result Banner if submitted */}
      {result && (
        <div
          className={`p-6 rounded-2xl border ${
            result.passed
              ? "bg-emerald-50/80 border-emerald-300 text-emerald-900"
              : "bg-red-50/80 border-red-300 text-red-900"
          } space-y-3`}
        >
          <div className="flex items-center gap-3">
            {result.passed ? (
              <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0" />
            ) : (
              <XCircle className="w-8 h-8 text-red-600 shrink-0" />
            )}
            <div>
              <h3 className="text-lg font-bold">
                {result.passed
                  ? "Outstanding! You Passed the Assessment"
                  : "Keep Studying and Try Again"}
              </h3>
              <p className="text-xs mt-0.5">
                You answered {result.correctCount} of {result.totalQuestions} questions correctly ({result.score}%). Passing threshold was {result.passingScore}%.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Link
              href={`/courses/${quiz.course.slug}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#0B1B3D] text-white hover:bg-[#132752] transition-colors"
            >
              <span>Return to Course</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#FF6B00]" />
            </Link>

            <button
              onClick={handleRetake}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retake Quiz</span>
            </button>
          </div>
        </div>
      )}

      {/* Questions List */}
      <div className="space-y-6">
        {questions.map((q, qIndex) => (
          <div
            key={q.id}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4"
          >
            <div className="flex items-start gap-3">
              <span className="w-7 h-7 rounded-lg bg-[#0B1B3D] text-white text-xs font-bold flex items-center justify-center shrink-0">
                {qIndex + 1}
              </span>
              <h3 className="text-sm font-bold text-[#0B1B3D] pt-0.5">
                {q.text}
              </h3>
            </div>

            {/* Options */}
            <div className="space-y-2 pl-10">
              {q.options.map((option, optIndex) => {
                const isSelected = selectedAnswers[q.id] === optIndex;

                return (
                  <label
                    key={optIndex}
                    onClick={() => handleSelect(q.id, optIndex)}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? "border-[#FF6B00] bg-orange-50/60 font-semibold text-[#0B1B3D] shadow-sm"
                        : "border-slate-200 hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question_${q.id}`}
                      checked={isSelected}
                      onChange={() => handleSelect(q.id, optIndex)}
                      disabled={!!result}
                      className="accent-[#FF6B00] shrink-0"
                    />
                    <span>{option}</span>
                  </label>
                );
              })}
            </div>

            {/* Explanation when reviewed */}
            {result && q.explanation && (
              <div className="ml-10 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
                <strong>Explanation:</strong> {q.explanation}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Bottom Submit Action */}
      {!result && (
        <div className="flex justify-end pt-4">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-xs text-white bg-[#FF6B00] hover:bg-[#EA580C] shadow-lg shadow-orange-500/25 transition-all hover:scale-105 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{submitting ? "Evaluating..." : "Submit Assessment"}</span>
          </button>
        </div>
      )}
    </div>
  );
}
