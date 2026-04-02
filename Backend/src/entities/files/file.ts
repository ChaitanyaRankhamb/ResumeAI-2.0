import { defaultResumeStructuredData, ResumeStructuredData } from "../../modules/resume/Normalization/types/normalizedResume";
import { UserId } from "../user/userId";

export class File {
  constructor(
    public readonly id: string,
    public userId: UserId,
    private readonly name: string,
    private readonly originalName: string,
    private readonly path: string,
    private readonly size: number, // in kb or mb
    private readonly format: string,
    public readonly uploadedAt: Date = new Date(),
    private readonly parseText: string[] = [], // Array to store parsed text sections of the resume
    private readonly structuredData: ResumeStructuredData = defaultResumeStructuredData(), // Structured JSON data from AI processing
  ) {}

  // GETTERS
  getName(): string {
    return this.name;
  }

  getOriginalName(): string {
    return this.originalName;
  }

  getPath(): string {
    return this.path;
  }

  getSize(): number {
    return this.size;
  }

  getFormat(): string {
    return this.format;
  }

  getParseText(): string[] {
    return this.parseText;
  }

  getStructuredData(): any {
    return this.structuredData;
  }
}
