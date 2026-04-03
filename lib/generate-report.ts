import Anthropic from "@anthropic-ai/sdk";
import type { CareReport } from "./care-report";
import type { Grade } from "./care-report";
import { CARE_REPORT_SYSTEM_PROMPT, PROMPT_VERSION } from "./report-prompt";

const anthropic = new Anthropic();

interface GenerateReportInput {
  sequence: number;
  coupleId: string;
  hasChildren: boolean;
  grades: {
    esb: Grade;
    csp: Grade;
    pci: Grade;
    stb: Grade;
  };
}

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 3000;

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function generateCareReport(
  input: GenerateReportInput,
): Promise<{ content: CareReport; modelVersion: string }> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await _generateCareReport(input);
    } catch (e) {
      lastError = e;
      console.error(`Report generation attempt ${attempt + 1} failed:`, e);
      if (attempt < MAX_RETRIES) {
        await sleep(RETRY_DELAY_MS * (attempt + 1));
      }
    }
  }

  throw lastError;
}

async function _generateCareReport(
  input: GenerateReportInput,
): Promise<{ content: CareReport; modelVersion: string }> {
  const { sequence, grades, hasChildren } = input;

  const childrenContext = hasChildren
    ? "자녀 유무: 자녀 있음 (현재 육아 중인 부부에게 맞는 실전적이고 구체적인 조언 중심)"
    : "자녀 유무: 자녀 없음 (예비 부모로서 앞으로의 육아를 준비하는 관점의 조언 중심)";

  const stream = anthropic.messages.stream({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 24000,
    system: CARE_REPORT_SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `아래 부부의 검사 결과를 바탕으로 육아 케어 리포트 JSON을 생성해줘.\n\n순번: ${sequence}\n${childrenContext}\nESB: ${grades.esb}\nCSP: ${grades.csp}\nPCI: ${grades.pci}\nSTB: ${grades.stb}`,
      },
    ],
  });

  const response = await stream.finalMessage();

  if (response.stop_reason !== "end_turn") {
    throw new Error(
      `Incomplete response: stop_reason=${response.stop_reason}`,
    );
  }

  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response from Claude");
  }

  let raw = textBlock.text.trim();
  // markdown 코드블록 제거
  if (raw.startsWith("```")) {
    raw = raw.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  }

  let content: CareReport;
  try {
    content = JSON.parse(raw) as CareReport;
  } catch (e) {
    console.error("Failed to parse report JSON. Raw response:", raw.slice(-200));
    throw e;
  }

  // meta에 couple_id 주입 (프롬프트에서는 생성하지 않으므로)
  content.meta.couple_id = input.coupleId;

  return {
    content,
    modelVersion: response.model,
  };
}

export { PROMPT_VERSION };
