// @ts-nocheck
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useUploadResume } from "./use-upload-resume";
import { UploadResumeForm } from "./upload-resume-form";
import { UploadResumeAnalysis } from "./upload-resume-analysis";

export function UploadResumeSection() {
  const {
    isUploading,
    uploadedFile,
    analysisStatusMessage,
    browsedFile,
    selectedFile,
    showAnalysisUI,
    fileInputRef,
    handleBrowseClick,
    handleUploadResumeClick,
    handleOpenAnalysisReport,
    handleDownloadAnalysisReport,
    handleInputChange,
  } = useUploadResume();

  return (
    <div className="relative min-h-[calc(100vh-64px)] overflow-hidden bg-linear-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating Orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-linear-to-r from-blue-400/20 to-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-linear-to-r from-indigo-400/15 to-pink-500/15 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-linear-to-r from-cyan-400/10 to-blue-500/10 rounded-full blur-3xl animate-pulse delay-500" />

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-size-[50px_50px] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)]" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col h-full items-center justify-center px-4 py-2">
        {/* Hero Section */}
        <div className="text-center mb-12 animate-in fade-in slide-in-from-top-4 duration-1000">
          <h1 className="text-5xl md:text-7xl font-bold bg-linear-to-r from-slate-900 via-blue-800 to-indigo-900 dark:from-white dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent mb-6 leading-tight">
            Upload Your Resume
          </h1>
          <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed font-light">
            Get instant AI-powered insights and personalized recommendations to
            <span className="font-semibold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {" "}
              elevate your career
            </span>
          </p>
        </div>

        {/* Main Container - Split Layout */}
        <motion.div
          layout
          transition={{ duration: 0.6 }}
          className="flex w-full max-w-7xl items-center justify-center gap-12"
        >
          <UploadResumeForm
            browsedFile={browsedFile}
            selectedFile={selectedFile}
            isUploading={isUploading}
            fileInputRef={fileInputRef}
            onBrowseClick={handleBrowseClick}
            onUploadClick={handleUploadResumeClick}
            onInputChange={handleInputChange}
          />

          <UploadResumeAnalysis
            showAnalysisUI={showAnalysisUI}
            uploadedFile={uploadedFile}
            analysisStatusMessage={analysisStatusMessage}
            onOpenReport={handleOpenAnalysisReport}
            onDownloadReport={handleDownloadAnalysisReport}
          />
        </motion.div>
      </div>
    </div>
  );
}
