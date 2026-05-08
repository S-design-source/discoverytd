import { siteConfig } from "@/config/site";
import { TimeSlot } from "@/types";

export function generateTimeSlots(
  bookedSlots: string[] = []
): TimeSlot[] {
  const { openHour, closeHour, slotMinutes } = siteConfig.business;
  const slots: TimeSlot[] = [];

  for (let h = openHour; h < closeHour; h++) {
    for (let m = 0; m < 60; m += slotMinutes) {
      const time = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
      slots.push({ time, available: !bookedSlots.includes(time) });
    }
  }
  return slots;
}

export function isClosedDay(date: Date): boolean {
  return siteConfig.business.closedDays.includes(date.getDay());
}

export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
}
