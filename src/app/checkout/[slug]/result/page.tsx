import React from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  RotateCcw, 
  BookOpen, 
  ShieldCheck, 
  Calendar, 
  CreditCard, 
  Sparkles 
} from "lucide-react";
import { formatDate, formatPrice } from "@/lib/utils";

interface ResultPageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    order?: string;
  }>;
}

export default async function CheckoutResultPage({
  params,
  searchParams,
}: ResultPageProps) {
  const { slug } = await params;
  const { order: orderNumber } = await searchParams;
  const user = await getCurrentUser();

  if (!user) {
    redirect(`/login?redirect=/courses/${slug}`);
  }

  if (!orderNumber) {
    redirect(`/courses/${slug}`);
  }

  const order = await db.order.findUnique({
    where: { orderNumber },
    include: {
      course: {
        include: {
          sections: {
            include: { lessons: true },
            orderBy: { order: "asc" },
          },
        },
      },
      payment: true,
      user: true,
    },
  });

  if (!order || order.userId !== user.id) {
    notFound();
  }

  const isSuccess = order.status === "COMPLETED";
  const firstLessonId = order.course.sections[0]?.lessons[0]?.id || "";

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 py-16 flex-1 w-full">
        {isSuccess ? (
          /* SUCCESSFUL PAYMENT RECEIPT */
          <div className="bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-10 shadow-xl space-y-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-inner ring-4 ring-emerald-500/10">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Simulated Transaction Approved</span>
              </span>
              <h1 className="text-2xl font-black text-[#0B1B3D]">
                Enrollment Successfully Activated!
              </h1>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto leading-relaxed">
                Your payment simulation has been verified server-side. Full curriculum access, classroom player, downloadable lab assets, and certification are now unlocked.
              </p>
            </div>

            {/* Official Order Receipt Card */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 text-left space-y-3 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="text-slate-500 font-semibold">Order Reference:</span>
                <span className="font-mono font-bold text-[#0B1B3D]">{order.orderNumber}</span>
              </div>

              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="text-slate-500 font-semibold">Course Enrolled:</span>
                <span className="font-bold text-[#FF6B00]">{order.course.title}</span>
              </div>

              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="text-slate-500 font-semibold">Amount Paid:</span>
                <span className="font-bold text-slate-900">{formatPrice(order.amount)}</span>
              </div>

              {order.payment && (
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="text-slate-500 font-semibold">Transaction ID:</span>
                  <span className="font-mono text-slate-700">{order.payment.providerTxnId}</span>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-semibold">Processing Timestamp:</span>
                <span className="text-slate-600">{formatDate(order.updatedAt)}</span>
              </div>
            </div>

            {/* Action CTAs */}
            <div className="space-y-3 pt-2">
              <Link
                href={`/courses/${order.course.slug}/learn/${firstLessonId}`}
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-heading font-bold bg-gradient-to-r from-[#FF6B00] to-[#EA580C] hover:opacity-95 text-white shadow-lg shadow-orange-500/25 text-sm transition-all"
              >
                <span>Enter Course Classroom</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/dashboard/student/courses"
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs transition-colors"
              >
                <span>Go to Student Enrolled Dashboard</span>
              </Link>
            </div>
          </div>
        ) : (
          /* FAILED OR DECLINED TRANSACTION */
          <div className="bg-white rounded-3xl border border-red-200 p-8 sm:p-10 shadow-xl space-y-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto shadow-inner ring-4 ring-red-500/10">
              <XCircle className="w-10 h-10" />
            </div>

            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200 mb-2">
                <span>Transaction Declined</span>
              </span>
              <h1 className="text-2xl font-black text-[#0B1B3D]">
                Simulated Payment Was Not Completed
              </h1>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto leading-relaxed">
                The test gateway declined this simulation. No course enrollment was activated and zero funds were transferred.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-left space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Order Reference:</span>
                <span className="font-mono font-bold">{order.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Recorded Status:</span>
                <span className="font-bold text-red-600">{order.status}</span>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <Link
                href={`/checkout/${slug}`}
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-heading font-bold bg-[#0B1B3D] hover:bg-[#132752] text-white shadow-md text-sm transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Retry Checkout (Select Approved Simulation)</span>
              </Link>

              <Link
                href={`/courses/${slug}`}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs transition-colors"
              >
                <span>Return to Course Overview</span>
              </Link>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
