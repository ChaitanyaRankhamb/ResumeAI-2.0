"use client";

import { DashboardNavbar } from "@/components/dashboard/navbar";
import { UploadResumeSection } from "@/components/dashboard/upload-resume-section";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();

  return (
    <>
      <UploadResumeSection />
    </>
  );
}
