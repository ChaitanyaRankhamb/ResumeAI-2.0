import { motion } from "framer-motion";
import { Upload, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrowsedFile } from "./upload-resume-types";

interface UploadResumeFormProps {
  browsedFile: BrowsedFile | null;
  selectedFile: File | null;
  isUploading: boolean;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onBrowseClick: () => void;
  onUploadClick: () => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function UploadResumeForm({
  browsedFile,
  selectedFile,
  isUploading,
  fileInputRef,
  onBrowseClick,
  onUploadClick,
  onInputChange,
}: UploadResumeFormProps) {
  return (
    <motion.div
      animate={{
        x: false ? -150 : 0,
        scale: false ? 0.95 : 1,
      }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
      className="flex-1 max-w-lg"
    >
      <div className="group relative rounded-3xl border bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl shadow-2xl hover:shadow-3xl transition-all duration-500 p-8 text-center transform border-blue-500 dark:border-blue-500">
        <div className="relative flex flex-col items-center justify-center space-y-6">
          <div className="relative">
            <div className="p-6 rounded-2xl bg-linear-to-br from-blue-500 to-purple-600 shadow-xl">
              <Upload className="w-8 h-8 text-white" />
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
              Choose your resume file
            </h3>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Select a PDF or DOCX file to begin your AI-powered analysis
              journey
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-linear-to-r from-blue-50 to-purple-50 dark:from-slate-700 dark:to-slate-600 border border-blue-200/50 dark:border-slate-600 shadow-sm">
            <div className="w-1.5 h-1.5 bg-linear-to-r from-blue-500 to-purple-500 rounded-full" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              PDF or DOCX • Max 10MB
            </span>
          </div>

          {browsedFile && (
            <div className="w-full p-4 rounded-2xl bg-linear-to-r from-slate-50 to-blue-50 dark:from-slate-700 dark:to-slate-600 border border-slate-200/50 dark:border-slate-600 shadow-lg animate-in fade-in slide-in-from-left-2 duration-500">
              <div className="flex items-center justify-between gap-4">
                <div className="p-3 rounded-xl bg-white dark:bg-slate-800 shadow-md border border-slate-200/50 dark:border-slate-600">
                  <FileText className="w-6 h-6 text-slate-600 dark:text-slate-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 dark:text-white truncate">
                    {browsedFile.name}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {(browsedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <div
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm ${
                    browsedFile.status === "Accepted"
                      ? "bg-linear-to-r from-green-400 to-emerald-500 text-white"
                      : "bg-linear-to-r from-red-400 to-pink-500 text-white"
                  }`}
                >
                  {browsedFile.status}
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
            <Button
              onClick={onBrowseClick}
              variant="outline"
              disabled={isUploading}
              className="flex-1 px-6 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-700 hover:border-blue-300 dark:hover:border-blue-500 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <span className="font-semibold">Browse Files</span>
            </Button>
            <Button
              onClick={onUploadClick}
              disabled={
                !selectedFile ||
                isUploading ||
                browsedFile?.status !== "Accepted"
              }
              className="flex-1 px-6 py-3 rounded-xl bg-linear-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isUploading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Uploading...</span>
                </div>
              ) : (
                <span>Start Analysis</span>
              )}
            </Button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx"
            onChange={onInputChange}
            className="hidden"
          />
        </div>
      </div>
    </motion.div>
  );
}
