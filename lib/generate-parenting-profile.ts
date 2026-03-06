import Anthropic from "@anthropic-ai/sdk";
import type { ParentingProfileReport } from "./parenting-profile-report";
import {
  PARENTING_PROFILE_SYSTEM_PROMPT,
  PARENTING_PROFILE_PROMPT_VERSION,
} from "./parenting-profile-prompt";

const anthropic = new Anthropic();

interface ProfileInput {
  nickname: string;
  role: "mom" | "dad";
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
  z_openness: number;
  z_conscientiousness: number;
  z_extraversion: number;
  z_agreeableness: number;
  z_neuroticism: number;
  attachment_type: string;
  aas_intensity: number;
  avoidance: number;
  anxiety: number;
  z_avoidance: number;
  z_anxiety: number;
  flexibility_level: number;
  flexibility_percentage: number;
  humor: number;
  conflict: number;
  z_humor: number;
  z_conflict: number;
}

export async function generateParentingProfile(
  input: ProfileInput,
): Promise<{ content: ParentingProfileReport; modelVersion: string }> {
  const stream = anthropic.messages.stream({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 12000,
    system: PARENTING_PROFILE_SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `아래 사용자의 검사 결과를 바탕으로 개인 육아 성향 리포트 JSON을 생성해줘.

닉네임: ${input.nickname}
역할: ${input.role}

[Big5 성격 점수]
개방성: ${input.openness} (z: ${input.z_openness})
성실성: ${input.conscientiousness} (z: ${input.z_conscientiousness})
외향성: ${input.extraversion} (z: ${input.z_extraversion})
우호성: ${input.agreeableness} (z: ${input.z_agreeableness})
신경성: ${input.neuroticism} (z: ${input.z_neuroticism})

[애착 성향]
유형: ${input.attachment_type}
강도: ${input.aas_intensity}
회피 점수: ${input.avoidance} (z: ${input.z_avoidance})
불안 점수: ${input.anxiety} (z: ${input.z_anxiety})

[정서적 유연성]
레벨: ${input.flexibility_level}
백분위: ${input.flexibility_percentage}%
유머 점수: ${input.humor} (z: ${input.z_humor})
갈등 대처 점수: ${input.conflict} (z: ${input.z_conflict})`,
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
  if (raw.startsWith("```")) {
    raw = raw.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  }

  let content: ParentingProfileReport;
  try {
    content = JSON.parse(raw) as ParentingProfileReport;
  } catch (e) {
    console.error(
      "Failed to parse parenting profile JSON. Raw response:",
      raw.slice(-200),
    );
    throw e;
  }

  return {
    content,
    modelVersion: response.model,
  };
}

export { PARENTING_PROFILE_PROMPT_VERSION };
