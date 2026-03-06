import Anthropic from "@anthropic-ai/sdk";
import type { CareReport } from "./care-report";
import type { Grade } from "./care-report";
import { CARE_REPORT_SYSTEM_PROMPT, PROMPT_VERSION } from "./report-prompt";

const anthropic = new Anthropic();

interface GenerateReportInput {
  sequence: number;
  coupleId: string;
  grades: {
    esb: Grade;
    csp: Grade;
    pci: Grade;
    stb: Grade;
  };
}

export async function generateCareReport(
  input: GenerateReportInput,
): Promise<{ content: CareReport; modelVersion: string }> {
  const { sequence, grades } = input;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 8000,
    system: CARE_REPORT_SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `아래 부부의 검사 결과를 바탕으로 육아 케어 리포트 JSON을 생성해줘.\n\n순번: ${sequence}\nESB: ${grades.esb}\nCSP: ${grades.csp}\nPCI: ${grades.pci}\nSTB: ${grades.stb}`,
      },
    ],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response from Claude");
  }

  const content = JSON.parse(textBlock.text) as CareReport;

  // meta에 couple_id 주입 (프롬프트에서는 생성하지 않으므로)
  content.meta.couple_id = input.coupleId;

  return {
    content,
    modelVersion: response.model,
  };
}

export { PROMPT_VERSION };
