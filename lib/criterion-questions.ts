import type { ReportType } from "@/lib/care-report";

export interface CriterionQuestion {
  code: string;
  indicator: "ESB" | "CSP" | "PCI" | "STB" | "SAT";
  text: string;
}

export const CRITERION_QUESTIONS: Record<ReportType, CriterionQuestion[]> = {
  no_child: [
    { code: "P1", indicator: "ESB", text: "나는 뱃속 아이와 교감하는 시간을 자주 갖는 편이다." },
    { code: "P2", indicator: "ESB", text: "임신 중 불안, 걱정되는 순간에도, '괜찮아'라며 안심하려고 노력한다." },
    { code: "P3", indicator: "CSP", text: "출산 후 아이에게 어떤 환경을 만들어줄지 미리 생각하거나 준비하고 있다." },
    { code: "P4", indicator: "PCI", text: "배우자와 양육 방식에 대해 미리 이야기를 나누고 있다." },
    { code: "P5", indicator: "STB", text: "개인적 스트레스를 태아에게 영향을 미치지 않도록 관리한다." },
    { code: "P6", indicator: "SAT", text: "전반적으로, 우리 부부는 좋은 부모가 될 준비가 되어 있다고 느낀다." },
  ],
  infant: [
    { code: "I1", indicator: "ESB", text: "아이가 울거나 보채면, 아이의 감정을 먼저 읽고 따뜻하게 반응하는 편이다." },
    { code: "I2", indicator: "ESB", text: "아이가 낯선 환경, 사람 앞에서 불안해할 때, 아이 곁에 머물며 안심시키려고 노력한다." },
    { code: "I3", indicator: "CSP", text: "아이에게 옹알이에 대답하거나, 사물의 이름을 알려주는 등 자주 말을 해준다." },
    { code: "I4", indicator: "PCI", text: "우리 부부는 아이의 돌봄 방식에 대해 대체로 같은 기준을 따르고 있다." },
    { code: "I5", indicator: "STB", text: "여러 가지로 지쳐 있어도, 아이를 돌볼 때 평소와 비슷한 태도를 유지하려고 한다." },
    { code: "I6", indicator: "SAT", text: "전반적으로, 나는 우리 부부가 아이를 잘 돌보고 있다고 느낀다." },
  ],
  toddler: [
    { code: "E1", indicator: "ESB", text: "아이가 실패하거나 속상해할 때, 결과보다 아이의 감정을 먼저 알아주는 편이다." },
    { code: "E2", indicator: "ESB", text: "아이가 떼를 쓸 때, 감정 자체는 받아주면서 행동 한계를 설정하려고 노력한다." },
    { code: "E3", indicator: "CSP", text: "아이의 '이건 뭐야?' 같은 질문에 귀찮아하지 않고, 아이 수준에 맞게 설명하거나 함께 찾아본다." },
    { code: "E4", indicator: "PCI", text: "우리 부부는 아이의 생활 규칙에 대해 대체로 같은 기준을 갖고 있다." },
    { code: "E5", indicator: "STB", text: "스트레스를 받은 날에도, 집에 와서 아이에게 짜증을 내지 않으려고 노력한다." },
    { code: "E6", indicator: "SAT", text: "전반적으로, 나는 우리 부부가 아이를 잘 키우고 있다고 느낀다." },
  ],
  elementary: [
    { code: "S1", indicator: "ESB", text: "아이가 시험 결과에 실망하거나 학교에서 속상한 일이 있을 때, 결과를 따지기보다 감정을 먼저 알아주는 편이다." },
    { code: "S2", indicator: "CSP", text: "아이가 공부에서 모르는 것이 있을 때, 답을 바로 알려주기보다 생각하는 방법을 함께 고민해 준다." },
    { code: "S3", indicator: "PCI", text: "우리 부부는 아이의 학습 관련 규칙에 대해 같은 기준을 가지고 있다." },
    { code: "S4", indicator: "STB", text: "아이 성적에 대한 걱정이 있어도, 그것을 아이에게 직접적인 압박이나 비교로 표현하지 않으려 한다." },
    { code: "S5", indicator: "STB", text: "부부 사이에 갈등이 있던 날에도, 아이와의 시간에서 평소와 비슷한 모습을 유지하려 한다." },
    { code: "S6", indicator: "SAT", text: "전반적으로, 나는 우리 부부가 아이의 학교생활과 성장을 잘 지원하고 있다고 느낀다." },
  ],
  middle_school: [
    { code: "M1", indicator: "ESB", text: "자녀가 사춘기 특유의 예민함이나 반항적 태도를 보여도, 감정적으로 맞받아치지 않고 차분하게 대응하는 편이다." },
    { code: "M2", indicator: "CSP", text: "자녀와 사회적 이슈나 진로에 대해, 일방적 훈계가 아닌 대등한 대화를 나누려고 한다." },
    { code: "M3", indicator: "PCI", text: "우리 부부는 자녀의 자율성 범위에 대해 같은 기준을 가지고 있다." },
    { code: "M4", indicator: "STB", text: "자녀의 성적이나 진학에 대한 불안이 있어도, 그것을 자녀에게 압박이나 비교로 표현하지 않으려 한다." },
    { code: "M5", indicator: "STB", text: "자녀의 학업과 관련하여 내 불안이 높아질 때, 그 불안을 자녀에게 전달하지 않도록 의식적으로 관리한다." },
    { code: "M6", indicator: "SAT", text: "전반적으로, 나는 우리 부부가 사춘기 자녀와 좋은 관계를 유지하고 있다고 느낀다." },
  ],
};

export const LIKERT_LABELS = [
  "전혀 그렇지 않다",
  "별로 그렇지 않다",
  "보통이다",
  "대체로 그렇다",
  "매우 그렇다",
] as const;
