export interface TheoryReference {
  title: string;
  author: string;
  description: string;
}

export interface ParentingTrait {
  trait: string;
  source: string;
  raw_score: number;
  z_score: number;
  level: number;
  type: "strength" | "neutral" | "growth";
  description: string;
  scene: string;
}

export interface ParentingProfileReport {
  meta: {
    user_id: string;
    nickname: string;
    role: "mom" | "dad";
    created_at: string;
  };

  parenting_type: {
    title: string;
    subtitle: string;
  };

  summary: {
    text: string;
    theory: TheoryReference;
  };

  parenting_traits: ParentingTrait[];

  attachment_parenting: {
    type: "secure" | "anxious" | "avoidant" | "fearful";
    type_text: string;
    intensity: number;
    title: string;
    description: string;
    strength: string;
    watchpoint: string;
    theory: TheoryReference;
  };

  emotional_flexibility: {
    level: number;
    percentage: number;
    title: string;
    description: string;
    humor_analysis: string;
    conflict_analysis: string;
    theory: TheoryReference;
  };

  highlights: {
    strengths: Array<{ title: string; description: string }>;
    growth_point: {
      title: string;
      description: string;
    };
  };

  tips: string[];

  closing: {
    text: string;
  };
}
