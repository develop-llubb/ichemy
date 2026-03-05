import { sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgSchema,
  pgTable,
  real,
  smallint,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

// ─── auth.users 참조 ───

const authSchema = pgSchema("auth");

const authUsers = authSchema.table("users", {
  id: uuid("id").primaryKey(),
});

// ─── enums ───

export const roleEnum = pgEnum("befe_role", ["mom", "dad"]);
export const attachmentTypeEnum = pgEnum("befe_attachment_type", [
  "secure",
  "anxious",
  "avoidant",
  "disorganized",
]);
export const gradeEnum = pgEnum("befe_grade", ["A", "B", "C", "D"]);

// ─── 공유 테이블 (읽기 전용, chemistry-rn과 동일) ───

export const tests = pgTable("tests", {
  id: text("id").primaryKey().notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  created_at: timestamp("created_at", { withTimezone: true, mode: "string" })
    .defaultNow()
    .notNull(),
  updated_at: timestamp("updated_at", {
    withTimezone: true,
    mode: "string",
  }).defaultNow(),
});

export const questions = pgTable("questions", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  test_id: text("test_id")
    .notNull()
    .references(() => tests.id, { onDelete: "cascade" }),
  domain: text("domain").notNull(),
  content: text("content").notNull(),
  selection_count: smallint("selection_count").default(5).notNull(),
  created_at: timestamp("created_at", { withTimezone: true, mode: "string" })
    .defaultNow()
    .notNull(),
  index: bigint("index", { mode: "number" }).default(0).notNull(),
});

// ─── 공유 report 테이블 (읽기 전용, chemistry-rn과 동일) ───

export type DetailEvaluation = { title: string; content: string };

export const reportBig5 = pgTable(
  "report_big_5",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    big_5_type: bigint("big_5_type", { mode: "number" }).notNull(),
    sequence: integer("sequence").notNull(),
    nickname: text("nickname").notNull(),
    title: text("title").notNull(),
    overall_evaluation: text("overall_evaluation").notNull(),
    detail_evaluations: text("detail_evaluations").notNull(),
    counseling_text: text("counseling_text").notNull(),
    created_at: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updated_at: timestamp("updated_at", {
      withTimezone: true,
      mode: "string",
    }).defaultNow(),
  },
  (table) => [unique("report_big_5_big_5_type_key").on(table.big_5_type)],
);

export const reportAas = pgTable("report_aas", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  type: text("type").notNull(),
  type_text: text("type_text").notNull(),
  aas_intensity: smallint("aas_intensity").notNull(),
  overall_evaluation: text("overall_evaluation").notNull(),
  detail_evaluations: jsonb("detail_evaluations")
    .$type<DetailEvaluation[]>()
    .notNull(),
  counseling_evaluations: jsonb("counseling_evaluations")
    .$type<DetailEvaluation[]>()
    .notNull(),
  created_at: timestamp("created_at", { withTimezone: true, mode: "string" })
    .defaultNow()
    .notNull(),
  updated_at: timestamp("updated_at", {
    withTimezone: true,
    mode: "string",
  }).defaultNow(),
  title: text("title").notNull(),
  sequence: smallint("sequence").notNull(),
});

export const reportFlexibility = pgTable("report_flexibility", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  flexibility_level: smallint("flexibility_level").notNull(),
  title: text("title").notNull(),
  overall_evaluation: text("overall_evaluation").notNull(),
  detail_evaluation: text("detail_evaluation").notNull(),
  counseling_text: text("counseling_text").notNull(),
  created_at: timestamp("created_at", { withTimezone: true, mode: "string" })
    .defaultNow()
    .notNull(),
  updated_at: timestamp("updated_at", {
    withTimezone: true,
    mode: "string",
  }).defaultNow(),
});

// ─── befe_profiles ───

export const befeProfiles = pgTable("befe_profiles", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  user_id: uuid("user_id")
    .notNull()
    .references(() => authUsers.id, { onDelete: "cascade" }),
  nickname: text("nickname"),
  role: roleEnum("role").notNull(),
  created_at: timestamp("created_at", { withTimezone: true, mode: "string" })
    .defaultNow()
    .notNull(),
  updated_at: timestamp("updated_at", {
    withTimezone: true,
    mode: "string",
  }).defaultNow(),

  third_party_agreed: boolean("third_party_agreed").default(false).notNull(),

  // 초대
  invited_by: uuid("invited_by"),

  // 테스트 진행
  test_index: integer("test_index").default(0).notNull(),
  test_completed: boolean("test_completed").default(false).notNull(),

  // Big5 원점수
  openness: real("openness"),
  conscientiousness: real("conscientiousness"),
  extraversion: real("extraversion"),
  agreeableness: real("agreeableness"),
  neuroticism: real("neuroticism"),

  // Big5 Z점수
  z_openness: real("z_openness"),
  z_conscientiousness: real("z_conscientiousness"),
  z_extraversion: real("z_extraversion"),
  z_agreeableness: real("z_agreeableness"),
  z_neuroticism: real("z_neuroticism"),

  // AAS 원점수
  avoidance: real("avoidance"),
  anxiety: real("anxiety"),

  // AAS Z점수
  z_avoidance: real("z_avoidance"),
  z_anxiety: real("z_anxiety"),

  // 정서유연성 원점수
  humor: real("humor"),
  conflict: real("conflict"),

  // 정서유연성 Z점수
  z_humor: real("z_humor"),
  z_conflict: real("z_conflict"),

  // 파생값
  big_5_type: bigint("big_5_type", { mode: "number" }),
  attachment_type: attachmentTypeEnum("attachment_type"),
  aas_intensity: smallint("aas_intensity"),
  flexibility_level: smallint("flexibility_level"),
  flexibility_percentage: real("flexibility_percentage"),
});

// ─── befe_answers ───

export const befeAnswers = pgTable(
  "befe_answers",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    profile_id: uuid("profile_id")
      .notNull()
      .references(() => befeProfiles.id, { onDelete: "cascade" }),
    question_id: uuid("question_id")
      .notNull()
      .references(() => questions.id, { onDelete: "restrict" }),
    answer: smallint("answer").notNull(),
    created_at: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    unique("befe_answers_profile_question_key").on(
      table.profile_id,
      table.question_id,
    ),
  ],
);

// ─── befe_couples ───

export const befeCouples = pgTable(
  "befe_couples",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    inviter_profile_id: uuid("inviter_profile_id")
      .notNull()
      .references(() => befeProfiles.id, { onDelete: "cascade" }),
    invitee_profile_id: uuid("invitee_profile_id")
      .notNull()
      .references(() => befeProfiles.id, { onDelete: "cascade" }),
    created_at: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    })
      .defaultNow()
      .notNull(),
    updated_at: timestamp("updated_at", {
      withTimezone: true,
      mode: "string",
    }).defaultNow(),

    // PNCAM 4대 지표
    esb_score: real("esb_score").notNull(),
    csp_score: real("csp_score").notNull(),
    pci_score: real("pci_score").notNull(),
    stb_score: real("stb_score").notNull(),

    // 등급
    esb_grade: gradeEnum("esb_grade").notNull(),
    csp_grade: gradeEnum("csp_grade").notNull(),
    pci_grade: gradeEnum("pci_grade").notNull(),
    stb_grade: gradeEnum("stb_grade").notNull(),

    // 중간값
    e_llubb: real("e_llubb"),
    l_llubb: real("l_llubb"),
    pcq_score: real("pcq_score"),
  },
  (table) => [
    unique("befe_couples_pair_key").on(
      table.inviter_profile_id,
      table.invitee_profile_id,
    ),
    index("idx_befe_couples_inviter").on(table.inviter_profile_id),
    index("idx_befe_couples_invitee").on(table.invitee_profile_id),
  ],
);

// ─── befe_reports (AI 리포트 캐시) ───

export const befeReports = pgTable(
  "befe_reports",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    couple_id: uuid("couple_id")
      .notNull()
      .references(() => befeCouples.id, { onDelete: "cascade" }),
    content: jsonb("content")
      .$type<{
        summary: string;
        esb_analysis: string;
        csp_analysis: string;
        pci_analysis: string;
        stb_analysis: string;
        esb_advice: string;
        csp_advice: string;
        pci_advice: string;
        stb_advice: string;
      }>()
      .notNull(),
    model_version: text("model_version").notNull(),
    prompt_version: text("prompt_version").notNull(),
    created_at: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [unique("befe_reports_couple_key").on(table.couple_id)],
);

// ─── befe_coupons ───

export const befeCoupons = pgTable("befe_coupons", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  code: text("code").notNull().unique(),
  event_name: text("event_name").notNull(),
  max_uses: integer("max_uses").notNull(),
  current_uses: integer("current_uses").default(0).notNull(),
  used_by: uuid("used_by")
    .array()
    .default(sql`'{}'::uuid[]`)
    .notNull(),
  expires_at: timestamp("expires_at", {
    withTimezone: true,
    mode: "string",
  }).notNull(),
  created_at: timestamp("created_at", { withTimezone: true, mode: "string" })
    .defaultNow()
    .notNull(),
});

// ─── 타입 추론 ───

export type BefeProfile = typeof befeProfiles.$inferSelect;
export type NewBefeProfile = typeof befeProfiles.$inferInsert;

export type BefeAnswer = typeof befeAnswers.$inferSelect;
export type NewBefeAnswer = typeof befeAnswers.$inferInsert;

export type BefeCouple = typeof befeCouples.$inferSelect;
export type NewBefeCouple = typeof befeCouples.$inferInsert;

export type BefeReport = typeof befeReports.$inferSelect;
export type NewBefeReport = typeof befeReports.$inferInsert;

export type BefeCoupon = typeof befeCoupons.$inferSelect;
export type NewBefeCoupon = typeof befeCoupons.$inferInsert;

export type Question = typeof questions.$inferSelect;
export type Test = typeof tests.$inferSelect;

export type ReportBig5 = typeof reportBig5.$inferSelect;
export type ReportAAS = typeof reportAas.$inferSelect;
export type ReportFlexibility = typeof reportFlexibility.$inferSelect;
