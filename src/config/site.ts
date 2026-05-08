export const siteConfig = {
  name: "My Booking",
  description: "간편하게 예약하세요",
  contact: {
    phone: "010-0000-0000",
    email: "hello@example.com",
    address: "서울시 강남구 테헤란로 123",
  },
  business: {
    openHour: 9,
    closeHour: 21,
    slotMinutes: 30,
    maxPartySize: 10,
    closedDays: [0] as number[], // 0=일요일, 6=토요일
  },
  services: [
    { name: "기본 서비스", duration: "30분", description: "기본 예약 서비스" },
    { name: "프리미엄 서비스", duration: "60분", description: "프리미엄 예약 서비스" },
    { name: "패키지", duration: "90분", description: "패키지 예약 서비스" },
  ],
};
