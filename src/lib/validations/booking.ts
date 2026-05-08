import { z } from "zod";

export const bookingSchema = z.object({
  date: z.string().min(1, "날짜를 선택해주세요"),
  time_slot: z.string().min(1, "시간을 선택해주세요"),
  name: z.string().min(2, "이름은 2자 이상이어야 합니다").max(50),
  phone: z
    .string()
    .regex(/^010-\d{4}-\d{4}$/, "올바른 연락처 형식을 입력해주세요 (010-XXXX-XXXX)"),
  email: z.string().email("올바른 이메일 형식을 입력해주세요").optional().or(z.literal("")),
  party_size: z.number().int().min(1).max(10),
  notes: z.string().max(500).optional(),
});

export type BookingSchemaType = z.infer<typeof bookingSchema>;
