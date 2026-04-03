"use server";

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface InquiryInput {
  company: string;
  name: string;
  phone: string;
  message?: string;
}

export async function submitInquiry(input: InquiryInput) {
  const { company, name, phone, message } = input;

  if (!company || !name || !phone) {
    return { error: "필수 항목을 모두 입력해 주세요." };
  }

  try {
    await resend.emails.send({
      from: "아이케미 B2B <noreply@llubb.com>",
      to: "yskim@llubb.com",
      subject: `[B2B 도입 문의] ${company} - ${name}`,
      html: `
        <h2>B2B 도입 상담 신청</h2>
        <table style="border-collapse:collapse;font-size:14px;">
          <tr><td style="padding:8px 16px 8px 0;font-weight:bold;">업체명</td><td>${company}</td></tr>
          <tr><td style="padding:8px 16px 8px 0;font-weight:bold;">담당자</td><td>${name}</td></tr>
          <tr><td style="padding:8px 16px 8px 0;font-weight:bold;">연락처</td><td>${phone}</td></tr>
          ${message ? `<tr><td style="padding:8px 16px 8px 0;font-weight:bold;vertical-align:top;">문의 내용</td><td>${message}</td></tr>` : ""}
        </table>
      `,
    });

    return { success: true };
  } catch (e) {
    console.error("Failed to send inquiry email:", e);
    return { error: "전송에 실패했습니다. 잠시 후 다시 시도해 주세요." };
  }
}
