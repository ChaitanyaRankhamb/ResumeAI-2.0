import { useState, useRef } from "react";
import { toast } from "sonner";
import { uploadResume } from "@/components/api/authApi";
import { UploadedFile, BrowsedFile } from "./upload-resume-types";
import { fetchapi } from "@/lib/refresh-user";
import { showToast } from "../show-toast";

export function useUploadResume() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [analysisStatusMessage, setAnalysisStatusMessage] =
    useState<string>("");
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [browsedFile, setBrowsedFile] = useState<BrowsedFile | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showAnalysisUI, setShowAnalysisUI] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (
      file.type === "application/pdf" ||
      file.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      const isAccepted = file.size <= 10 * 1024 * 1024; // 10MB
      setBrowsedFile({
        name: file.name,
        size: file.size,
        status: isAccepted ? "Accepted" : "Not Accepted",
      });
      setSelectedFile(file);
    } else {
      toast.error("Please select a valid PDF or DOCX file");
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleUploadResumeClick = async () => {
    if (!selectedFile) {
      toast.error("Please select a file first");
      return;
    }

    if (!browsedFile || browsedFile.status !== "Accepted") {
      toast.error("Please select a valid file under 10MB");
      return;
    }

    setIsUploading(true);
    setShowAnalysisUI(true);
    setAnalysisStatusMessage(
      "Resume upload started. Connecting to progress and analysis...",
    );
    setAnalysisData(null);

    try {
      setUploadedFile({
        name: selectedFile.name,
        uploadDate: new Date().toLocaleDateString(),
        status: "analyzing",
      });

      const response = await uploadResume(selectedFile);

      if (response.success) {
        const fileId = response.data?.fileId;
        const generatedAnalysisData = response.data?.analyzedData ?? null;

        console.log("[Upload] API Response data:", generatedAnalysisData);
        console.log("[Upload] Extracted fileId:", fileId);

        setAnalysisData(generatedAnalysisData);
        setAnalysisStatusMessage(
          fileId
            ? "Resume uploaded. Analysis completed and report is ready."
            : "Resume uploaded. Waiting for analysis data...",
        );

        setUploadedFile((prev) =>
          prev
            ? {
                ...prev,
                status: "completed",
                resumeId: fileId,
                fileId: fileId,
              }
            : null,
        );
        toast.success("Resume uploaded! Processing finished.");
      } else {
        throw new Error(response.message || "Upload failed");
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Failed to upload resume");
      setUploadedFile(null);
      setShowAnalysisUI(false);
    } finally {
      setIsUploading(false);
    }
  };

  const handleOpenAnalysisReport = () => {
    if (!uploadedFile?.fileId || !analysisData) {
      toast.error("Report is not available yet");
      return;
    }

    // Store analysis data in localStorage for the report page to access
    const reportDataKey = `resume-analysis-${uploadedFile.fileId}`;
    localStorage.setItem(reportDataKey, JSON.stringify(analysisData));

    // Open report page with fileId
    window.open(`/dashboard/report?fileId=${uploadedFile.fileId}`, "_blank");
  };

  const handleDownloadAnalysisReport = async () => {
    if (!uploadedFile?.fileId) {
      showToast({
        title: "Report is not available yet",
        type: "error",
      });
      return;
    }

    const toastId = "download-toast";

    showToast({
      type: "loading",
      title: "Downloading report...",
      description: "Please wait while we prepare your PDF",
      id: toastId,
    });

    try {
      const response = await fetchapi(
        `http://localhost:5000/report/download/${uploadedFile.fileId}`,
        {
          method: "GET",
        },
      );

      if (!response.ok) {
        showToast({
          title: "Failed to download PDF",
          type: "error",
        });
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `resume-report-${uploadedFile.fileId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);

      showToast({
        type: "success",
        title: "Download complete",
        description: `Report ${uploadedFile.fileId} is ready`,
        id: toastId,
      });
    } catch (err) {
      showToast({
        type: "error",
        title: "Download failed",
        description: "Please try again",
        id: toastId,
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  return {
    isUploading,
    uploadedFile,
    analysisStatusMessage,
    analysisData,
    browsedFile,
    selectedFile,
    showAnalysisUI,
    fileInputRef,
    handleBrowseClick,
    handleUploadResumeClick,
    handleOpenAnalysisReport,
    handleDownloadAnalysisReport,
    handleInputChange,
  };
}
