"use client";

import React, { useState } from "react";
import { 
  Bell, 
  Send, 
  Trash2, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle,
  Radio,
  Clock,
  Users,
  ShieldCheck
} from "lucide-react";
import { 
  broadcastAnnouncementAction, 
  deleteBroadcastAnnouncementAction 
} from "@/app/actions/admin";

export interface BroadcastAnnouncementItem {
  id: string;
  title: string;
  message: string;
  priority: "NORMAL" | "HIGH" | "URGENT" | string;
  scope: "ALL" | "STUDENTS" | "TRAINERS" | string;
  authorName: string;
  createdAt: string;
}

interface AdminSettingsClientProps {
  announcements: BroadcastAnnouncementItem[];
}

export function AdminSettingsClient({ announcements }: AdminSettingsClientProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BroadcastAnnouncementItem | null>(null);

  const handleBroadcast = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsProcessing(true);
    setToast(null);
    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      await broadcastAnnouncementAction(formData);
      setToast({
        type: "success",
        message: "Institutional announcement broadcasted live to all target notification feeds.",
      });
      form.reset();
    } catch (err: any) {
      setToast({
        type: "error",
        message: err?.message || "Failed to publish broadcast announcement.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsProcessing(true);
    setToast(null);
    try {
      await deleteBroadcastAnnouncementAction(deleteTarget.id);
      setToast({
        type: "success",
        message: "Announcement revoked and removed from user feeds.",
      });
      setDeleteTarget(null);
    } catch (err: any) {
      setToast({
        type: "error",
        message: err?.message || "Failed to revoke announcement.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {toast && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between gap-3 text-xs font-semibold border ${
            toast.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {toast.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="text-xs font-bold hover:underline opacity-80"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Broadcast Composer */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 sm:p-8 space-y-6">
        <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-[#FF6B00]" />
            <div>
              <h2 className="text-base font-bold text-[#0B1B3D]">
                Institutional Broadcast Announcement Center
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Publish system-wide notifications instantly visible across Student, Trainer, and Admin notification bells
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-50 text-[#FF6B00] text-[11px] font-bold border border-orange-200">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Live Broadcast Engine</span>
          </span>
        </div>

        <form onSubmit={handleBroadcast} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="font-bold text-[#0B1B3D]">Announcement Headline *</label>
              <input
                type="text"
                name="title"
                required
                placeholder="e.g. FYP Milestone Submission Deadline Extension"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-[#FF6B00]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-[#0B1B3D]">Priority Level</label>
              <select
                name="priority"
                defaultValue="NORMAL"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-[#FF6B00] bg-white cursor-pointer"
              >
                <option value="NORMAL">Normal Priority</option>
                <option value="HIGH">High Priority (Emphasized)</option>
                <option value="URGENT">Urgent (Unread Alert)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-[#0B1B3D]">Announcement Message *</label>
            <textarea
              name="message"
              required
              rows={3}
              placeholder="Provide clear institutional details, policy updates, or academic milestones..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-[#FF6B00]"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-2">
              <label className="font-bold text-[#0B1B3D] shrink-0">Target Audience Scope:</label>
              <select
                name="scope"
                defaultValue="ALL"
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold bg-white cursor-pointer focus:outline-hidden"
              >
                <option value="ALL">All Academy Members (Students + Faculty)</option>
                <option value="STUDENTS">Students Only</option>
                <option value="TRAINERS">Trainers & Faculty Only</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-[#FF6B00] hover:bg-[#EA580C] text-white shadow-md shadow-orange-500/20 disabled:opacity-50 transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isProcessing ? "Broadcasting..." : "Publish Broadcast"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Active Announcements List */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 sm:p-8 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-purple-600" />
            <h3 className="text-sm font-bold text-[#0B1B3D]">
              Active & Historical Broadcast Announcements ({announcements.length})
            </h3>
          </div>
          <span className="text-xs text-slate-400">Stored on operational ledger</span>
        </div>

        {announcements.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No institutional announcements currently broadcasted. Use the composer above to publish updates.
          </div>
        ) : (
          <div className="space-y-3">
            {announcements.map((item) => {
              const priorityClass = {
                URGENT: "bg-rose-50 text-rose-700 border-rose-200",
                HIGH: "bg-amber-50 text-amber-700 border-amber-200",
                NORMAL: "bg-blue-50 text-blue-700 border-blue-200",
              }[item.priority] || "bg-slate-50 text-slate-700 border-slate-200";

              return (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors flex flex-col sm:flex-row sm:items-start justify-between gap-4 text-xs"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${priorityClass}`}>
                        {item.priority}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                        Scope: {item.scope}
                      </span>
                      <h4 className="font-extrabold text-[#0B1B3D] text-sm">{item.title}</h4>
                    </div>

                    <p className="text-slate-600 leading-relaxed text-xs">
                      {item.message}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1">
                      <span>Published by: <strong className="text-slate-600">{item.authorName}</strong></span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {item.createdAt}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => setDeleteTarget(item)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors self-end sm:self-start shrink-0"
                    title="Revoke / Delete announcement"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Revoke Confirmation Modal */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setDeleteTarget(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full shadow-2xl p-6 border border-slate-200 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-base font-extrabold text-[#0B1B3D]">
              Revoke Broadcast Announcement
            </h3>

            <p className="text-xs text-slate-500 leading-relaxed">
              Are you sure you want to revoke &quot;{deleteTarget.title}&quot;? It will be immediately removed from student and trainer notification feeds.
            </p>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleConfirmDelete}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white disabled:opacity-40"
              >
                {isProcessing ? "Revoking..." : "Confirm Revocation"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
