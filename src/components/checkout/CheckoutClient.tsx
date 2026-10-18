"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ShieldCheck, 
  CreditCard, 
  Smartphone, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowLeft, 
  Sparkles, 
  Lock, 
  Loader2, 
  HelpCircle,
  XCircle
} from "lucide-react";
import { processSimulatedPaymentAction, cancelOrderAction } from "@/app/actions/checkout";
import { formatPrice } from "@/lib/utils";

interface CheckoutClientProps {
  course: {
    id: string;
    title: string;
    slug: string;
    price: number;
    category: { name: string };
    instructor: { name: string };
    thumbnail: string | null;
  };
  order: {
    id: string;
    orderNumber: string;
    amount: number;
    currency: string;
  };
  user: {
    name: string;
    email: string;
  };
}

export function CheckoutClient({ course, order, user }: CheckoutClientProps) {
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState<"CARD" | "WALLET">("CARD");
  const [scenario, setScenario] = useState<"SUCCESS" | "DECLINED_INSUFFICIENT" | "DECLINED_VERIFICATION">("SUCCESS");
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const formData = new FormData();
    formData.set("orderNumber", order.orderNumber);
    formData.set("paymentMethod", paymentMethod === "CARD" ? "DEMO_1LINK_CARD" : "DEMO_MOBILE_WALLET");
    formData.set("scenario", scenario);

    startTransition(async () => {
      try {
        const result = await processSimulatedPaymentAction(formData);

        if (result.success) {
          router.push(`/checkout/${course.slug}/result?order=${order.orderNumber}`);
        } else if (result.error) {
          setErrorMessage(result.error);
        }
      } catch (err: unknown) {
        setErrorMessage(err instanceof Error ? err.message : "Payment processing error.");
      }
    });
  };

  const handleCancel = () => {
    if (!confirm("Are you sure you want to cancel this order?")) return;
    startTransition(async () => {
      await cancelOrderAction(order.orderNumber);
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Prominent Academic Demo Sandbox Notice */}
      <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl flex items-start gap-3 shadow-xs">
        <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 leading-relaxed">
          <strong className="font-bold block text-sm text-amber-950 uppercase tracking-wider mb-0.5">
            Academic FYP Demo Sandbox — No Real Monetary Charges
          </strong>
          This checkout simulator is engineered for evaluation and defense demonstrations. It models an end-to-end payment gateway transaction, including server-side price validation, atomic enrollment, and idempotency, without charging real funds or collecting sensitive banking credentials.
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Payment Form (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h1 className="text-xl font-extrabold text-[#0B1B3D]">
              Select Payment Instrument
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Choose your test payment method and select a simulation scenario.
            </p>
          </div>

          {errorMessage && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-start gap-2.5">
              <XCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
              <div>
                <strong className="block font-bold">Transaction Declined</strong>
                <span>{errorMessage}</span>
              </div>
            </div>
          )}

          <form onSubmit={handlePay} className="space-y-6">
            {/* Payment Method Switcher */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod("CARD")}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                  paymentMethod === "CARD"
                    ? "border-[#FF6B00] bg-orange-50/40 ring-2 ring-orange-500/20"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#0B1B3D]">Credit / Debit Card</div>
                  <div className="text-[10px] text-slate-400">1Link / PayPak / Visa</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("WALLET")}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                  paymentMethod === "WALLET"
                    ? "border-[#FF6B00] bg-orange-50/40 ring-2 ring-orange-500/20"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#0B1B3D]">Mobile Wallet</div>
                  <div className="text-[10px] text-slate-400">Easypaisa / JazzCash</div>
                </div>
              </button>
            </div>

            {/* Test Simulation Scenario Selector */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="text-xs font-bold text-[#0B1B3D] flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-[#FF6B00]" />
                <span>Simulation Scenario (Evaluator Test Suite)</span>
              </div>

              <div className="space-y-2 text-xs">
                <label className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-white cursor-pointer border border-transparent hover:border-slate-200 transition-colors">
                  <input
                    type="radio"
                    name="scenario"
                    checked={scenario === "SUCCESS"}
                    onChange={() => setScenario("SUCCESS")}
                    className="text-[#FF6B00] focus:ring-[#FF6B00]"
                  />
                  <div>
                    <span className="font-bold text-emerald-700 block">
                      Approved Transaction (Success Path)
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Simulates successful bank authorization & instant course access.
                    </span>
                  </div>
                </label>

                <label className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-white cursor-pointer border border-transparent hover:border-slate-200 transition-colors">
                  <input
                    type="radio"
                    name="scenario"
                    checked={scenario === "DECLINED_INSUFFICIENT"}
                    onChange={() => setScenario("DECLINED_INSUFFICIENT")}
                    className="text-[#FF6B00] focus:ring-[#FF6B00]"
                  />
                  <div>
                    <span className="font-bold text-red-600 block">
                      Declined: Insufficient Funds (Error Path)
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Simulates bank decline. Order is marked failed with zero access.
                    </span>
                  </div>
                </label>

                <label className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-white cursor-pointer border border-transparent hover:border-slate-200 transition-colors">
                  <input
                    type="radio"
                    name="scenario"
                    checked={scenario === "DECLINED_VERIFICATION"}
                    onChange={() => setScenario("DECLINED_VERIFICATION")}
                    className="text-[#FF6B00] focus:ring-[#FF6B00]"
                  />
                  <div>
                    <span className="font-bold text-amber-700 block">
                      Declined: OTP / 3DS Verification Failed
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Simulates authorization failure. Order is marked failed.
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Simulated Card / Wallet Fields */}
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Account / Cardholder Name</label>
                <input
                  type="text"
                  defaultValue={user.name}
                  readOnly
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 border border-slate-200 text-slate-700 font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  {paymentMethod === "CARD" ? "Simulated Card Number" : "Simulated Wallet Account"}
                </label>
                <input
                  type="text"
                  defaultValue={paymentMethod === "CARD" ? "4000 0000 0000 0001 (Test Visa)" : "0300-1234567 (Test Wallet)"}
                  readOnly
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 border border-slate-200 text-slate-700 font-mono font-semibold"
                />
              </div>
            </div>

            {/* PCI-DSS Security Guarantee */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-2 text-[11px] text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>PCI-DSS Compliant:</strong> Real card numbers, CVVs, and bank passwords are never requested or stored.
              </span>
            </div>

            {/* Submit Action */}
            <div className="space-y-2 pt-2">
              <button
                type="submit"
                disabled={isPending}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#FF6B00] to-[#EA580C] hover:opacity-95 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing Simulated Payment...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Authorize & Complete Payment ({formatPrice(order.amount)})</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleCancel}
                disabled={isPending}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:text-red-600 hover:bg-slate-50 transition-colors"
              >
                Cancel Order & Return to Course
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Order Summary (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5 sticky top-24">
          <div className="border-b border-slate-100 pb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF6B00]">
              Academic Order Summary
            </span>
            <div className="text-xs text-slate-400 font-mono mt-0.5">
              Ref: {order.orderNumber}
            </div>
          </div>

          <div className="flex gap-3">
            <img
              src={course.thumbnail || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800"}
              alt={course.title}
              className="w-20 h-16 rounded-xl object-cover shrink-0 border border-slate-100"
            />
            <div>
              <span className="text-[10px] font-bold text-[#FF6B00] uppercase">
                {course.category.name}
              </span>
              <h3 className="text-xs font-bold text-[#0B1B3D] line-clamp-2">
                {course.title}
              </h3>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Faculty: {course.instructor.name}
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-3 border-t border-slate-100 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Standard Curriculum Fee:</span>
              <span className="font-semibold">{formatPrice(order.amount)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Academic License & Platform Tax:</span>
              <span className="text-emerald-600 font-semibold">Included (0.00)</span>
            </div>
            <div className="flex justify-between text-sm font-extrabold text-[#0B1B3D] pt-2 border-t border-slate-100">
              <span>Total Payable:</span>
              <span className="text-base text-[#FF6B00]">{formatPrice(order.amount)}</span>
            </div>
          </div>

          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-[11px] text-emerald-800 space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Full Lifetime Curriculum Access</span>
            </div>
            <p className="text-[10px] text-emerald-700">
              Includes classroom player, downloadable lab materials, capstone project grading, and verified credential generation upon 100% completion.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
