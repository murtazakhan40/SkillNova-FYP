import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import QRCode from "qrcode";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { 
  CertificateGalleryClient, 
  CertificateData, 
  InProgressCourseData 
} from "@/components/dashboard/CertificateGalleryClient";
import { getStudentNotifications } from "@/lib/notifications";
import { ArrowLeft, Sparkles, Award } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function StudentCertificatesPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const [notifications, certificates, inProgressEnrollments] = await Promise.all([
    getStudentNotifications(user.id),
    db.certificate.findMany({
      where: { userId: user.id },
      include: {
        course: {
          include: {
            instructor: true,
            category: true,
          },
        },
      },
      orderBy: { issuedAt: "desc" },
    }),
    db.enrollment.findMany({
      where: {
        userId: user.id,
        progress: { lt: 100 },
      },
      include: {
        course: {
          include: {
            sections: {
              include: {
                lessons: {
                  include: {
                    progress: {
                      where: { userId: user.id },
                    },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { progress: "desc" },
    }),
  ]);

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const certificateData: CertificateData[] = await Promise.all(
    certificates.map(async (cert) => {
      let qrCodeDataUrl = "";
      try {
        const verifyUrl = `${baseUrl.replace(/\/$/, "")}/verify?code=${encodeURIComponent(cert.certificateCode)}`;
        qrCodeDataUrl = await QRCode.toDataURL(verifyUrl, {
          width: 120,
          margin: 1,
          color: { dark: "#0B1B3D", light: "#FFFFFF" },
        });
      } catch (err) {
        console.error("Failed to generate QR data url:", err);
      }

      return {
        id: cert.id,
        certificateCode: cert.certificateCode,
        issuedAt: formatDate(cert.issuedAt),
        studentName: user.name,
        grade: cert.grade,
        isRevoked: cert.isRevoked,
        revokedReason: cert.revokedReason,
        qrCodeDataUrl,
        course: {
          id: cert.course.id,
          title: cert.course.title,
          slug: cert.course.slug,
          categoryName: cert.course.category.name,
          instructorName: cert.course.instructor.name,
          instructorHeadline: cert.course.instructor.headline,
        },
      };
    })
  );

  const inProgressData: InProgressCourseData[] = inProgressEnrollments.map((enr) => {
    const allLessons = enr.course.sections.flatMap((s) => s.lessons);
    const uncompleted = allLessons.filter(
      (l) => !l.progress.some((p) => p.isCompleted)
    ).length;

    return {
      id: enr.id,
      title: enr.course.title,
      slug: enr.course.slug,
      progress: Math.round(enr.progress),
      remainingLessons: uncompleted > 0 ? uncompleted : 1,
    };
  });

  return (
    <DashboardShell user={user} notifications={notifications}>
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <Link
            href="/dashboard/student"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#0B1B3D] transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Overview</span>
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B1B3D]">
              Verified Digital Certificates
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-[11px] font-bold text-emerald-700">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              <span>Official Academic Ledger</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            View, print, and verify your official course completion credentials. Each certificate
            is backed by cryptographic verification on the SkillNova public ledger.
          </p>
        </div>

        <CertificateGalleryClient
          certificates={certificateData}
          inProgressCourses={inProgressData}
        />
      </div>
    </DashboardShell>
  );
}
