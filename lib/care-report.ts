export type Grade = "A" | "B" | "C" | "D";
export type ReportType = "no_child" | "infant" | "toddler" | "elementary" | "middle_school";

export interface TheoryReference {
  title: string;
  author: string;
  description: string;
}

export interface Scene {
  type: "strength" | "growth";
  title: string;
  content: string;
}

export interface IndicatorAnalysis {
  code: "ESB" | "CSP" | "PCI" | "STB";
  name: string;
  name_en: string;
  grade: Grade;
  grade_label: string;

  description: string;
  description_theory: TheoryReference;

  interpretation: string;

  scenes: [Scene, Scene];
  scenes_theory?: TheoryReference | null;

  tips: string[];
}

export interface PrenatalActivity {
  type_name: string;
  reason: string;
  activities: string[];
  how_to_start: string;
  together: string;
}

export interface PrenatalGuide {
  communication_style: string;
  activities: PrenatalActivity[];
  daily_conversation: string;
  script: string;
  one_line_message: string;
}

export interface CareReport {
  meta: {
    sequence: number;
    created_at: string;
    couple_id: string;
  };

  grades: {
    esb: Grade;
    csp: Grade;
    pci: Grade;
    stb: Grade;
  };

  summary: {
    text: string;
    theory: TheoryReference;
  };

  indicators: [
    IndicatorAnalysis,
    IndicatorAnalysis,
    IndicatorAnalysis,
    IndicatorAnalysis,
  ];

  closing: {
    text: string;
    theory: TheoryReference;
  };

  prenatal?: PrenatalGuide;
}
