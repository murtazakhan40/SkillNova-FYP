import { redirect } from "next/navigation";

export default function StudentCertificatesRedirect() {
  redirect("/verify?code=SN-2026-X89J21");
}
