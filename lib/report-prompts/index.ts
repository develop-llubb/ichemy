import type { ReportType } from "@/lib/care-report";
import { NO_CHILD_PROMPT } from "./no-child";
import { INFANT_PROMPT } from "./infant";
import { TODDLER_PROMPT } from "./toddler";
import { ELEMENTARY_PROMPT } from "./elementary";
import { MIDDLE_SCHOOL_PROMPT } from "./middle-school";

const PROMPTS: Record<ReportType, string> = {
  no_child: NO_CHILD_PROMPT,
  infant: INFANT_PROMPT,
  toddler: TODDLER_PROMPT,
  elementary: ELEMENTARY_PROMPT,
  middle_school: MIDDLE_SCHOOL_PROMPT,
};

export function getSystemPrompt(reportType: ReportType): string {
  return PROMPTS[reportType];
}
