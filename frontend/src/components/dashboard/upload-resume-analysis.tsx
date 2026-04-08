import { motion, AnimatePresence } from "framer-motion";
import { UploadedFileStatus } from "./uploaded-file-status";
import { UploadedFile } from "./upload-resume-types";

interface UploadResumeAnalysisProps {
  showAnalysisUI: boolean;
  uploadedFile: UploadedFile | null;
  analysisStatusMessage: string;
  onOpenReport: () => void;
  onDownloadReport: () => void;
}

export function UploadResumeAnalysis({
  showAnalysisUI,
  uploadedFile,
  analysisStatusMessage,
  onOpenReport,
  onDownloadReport,
}: UploadResumeAnalysisProps) {
  return (
    <>
      <AnimatePresence>
        {showAnalysisUI && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "60%" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.5 }}
            className="w-px bg-linear-to-b from-transparent via-slate-300 dark:via-slate-600 to-transparent rounded-full"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAnalysisUI && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, x: 100 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: 100 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="w-100 h-auto rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl shadow-2xl border border-blue-500 dark:border-blue-500 p-6 flex flex-col items-center justify-start"
          >
            {uploadedFile && (
              <UploadedFileStatus
                uploadedFile={uploadedFile}
                onOpenReport={onOpenReport}
                onDownloadReport={onDownloadReport}
              />
            )}

            {analysisStatusMessage && (
              <div className="mt-4 w-full rounded-2xl border border-slate-200/70 bg-slate-50/80 dark:bg-slate-900/80 p-4 text-sm text-slate-700 dark:text-slate-200">
                {analysisStatusMessage}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}