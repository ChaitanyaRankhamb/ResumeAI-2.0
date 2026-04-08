"use client";

import { FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface UploadedFile {
  name: string;
  uploadDate: string;
  status: "analyzing" | "completed";
  resumeId?: string;
}

interface UploadedFileStatusProps {
  uploadedFile: UploadedFile;
  onOpenReport?: () => void;
  onDownloadReport?: () => void;
}

export function UploadedFileStatus({
  uploadedFile,
  onOpenReport,
  onDownloadReport,
}: UploadedFileStatusProps) {
  return (
    <div className="w-full max-w-sm animate-in fade-in slide-in-from-right-2 duration-300">
      <div className="group relative rounded-2xl border border-border bg-card/60 backdrop-blur-xl shadow-sm hover:shadow-md transition-all duration-300 p-5 space-y-4">
        {/* Top Section */}
        <div className="flex items-start justify-between">
          {/* File Info */}
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-muted/60 border border-border">
              <FileText className="w-5 h-5 text-muted-foreground" />
            </div>

            <div className="space-y-0.5">
              <p className="font-medium text-foreground truncate max-w-[180px]">
                {uploadedFile.name}
              </p>
              <p className="text-xs text-muted-foreground">
                Uploaded on {uploadedFile.uploadDate}
              </p>
            </div>
          </div>

          {/* Status Badge */}
          <Badge
            className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
              uploadedFile.status === "completed"
                ? "bg-green-500/10 text-green-600 border border-green-500/20"
                : "bg-yellow-500/10 text-yellow-600 border border-yellow-500/20"
            }`}
          >
            {uploadedFile.status === "analyzing" ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" />
                Analyzing
              </>
            ) : (
              "Completed"
            )}
          </Badge>
        </div>

        {/* Divider */}
        <div className="h-px bg-border/60" />

        {/* Action Buttons */}
        {uploadedFile.status === "completed" && (
          <div className="flex flex-col gap-2 pt-1">
            <Button
              onClick={onOpenReport}
              className="w-full rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer"
              size="sm"
            >
              Open Analysis Report
            </Button>

            <Button
              onClick={onDownloadReport}
              variant="outline"
              className="w-full rounded-lg hover:bg-muted/60 transition-all cursor-pointer"
              size="sm"
            >
              Download Report
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}