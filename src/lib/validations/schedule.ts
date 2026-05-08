import { z } from "zod";

export const scheduleSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "날짜 형식이 올바르지 않습니다"),
  sample_code: z.string().min(1, "샘플품번을 입력해주세요").max(100),
  content: z.string().min(1, "내용을 입력해주세요").max(1000),
});

export const companyCreateSchema = z.object({
  name: z.string().min(1, "업체명을 입력해주세요").max(100),
  company_code: z
    .string()
    .min(1, "업체코드를 입력해주세요")
    .max(20)
    .regex(/^[A-Z0-9_-]+$/, "영문 대문자, 숫자, _, -만 사용 가능합니다"),
  login_id: z
    .string()
    .min(3, "아이디는 3자 이상이어야 합니다")
    .max(50)
    .regex(/^[a-z0-9_]+$/, "소문자, 숫자, _만 사용 가능합니다"),
  password: z.string().min(8, "비밀번호는 8자 이상이어야 합니다"),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .optional(),
});

export const modelScheduleSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "날짜 형식이 올바르지 않습니다"),
  start_time: z.string().regex(/^\d{2}:\d{2}$/, "시간 형식이 올바르지 않습니다"),
  end_time: z.string().regex(/^\d{2}:\d{2}$/, "시간 형식이 올바르지 않습니다"),
  content: z.string().max(1000).optional(),
});

export const modelCreateSchema = z.object({
  name: z.string().min(1, "모델명을 입력해주세요").max(100),
  login_id: z
    .string()
    .min(3, "아이디는 3자 이상이어야 합니다")
    .max(50)
    .regex(/^[a-z0-9_]+$/, "소문자, 숫자, _만 사용 가능합니다"),
  password: z.string().min(8, "비밀번호는 8자 이상이어야 합니다"),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
});

export type ScheduleSchemaType = z.infer<typeof scheduleSchema>;
export type CompanyCreateSchemaType = z.infer<typeof companyCreateSchema>;
export type ModelScheduleSchemaType = z.infer<typeof modelScheduleSchema>;
export type ModelCreateSchemaType = z.infer<typeof modelCreateSchema>;
