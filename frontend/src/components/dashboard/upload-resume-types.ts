export interface UploadedFile {
  name: string;
  uploadDate: string;
  status: "analyzing" | "completed";
  resumeId?: string;
  fileId?: string;
}

export interface BrowsedFile {
  name: string;
  size: number;
  status: "Accepted" | "Not Accepted";
}