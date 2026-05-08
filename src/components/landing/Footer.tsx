import { siteConfig } from "@/config/site";

export default function Footer() {
  const { openHour, closeHour } = siteConfig.business;
  return (
    <footer className="bg-gray-900 text-gray-400 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <h3 className="text-white font-bold text-lg mb-4">{siteConfig.name}</h3>
        <div className="grid sm:grid-cols-2 gap-4 text-sm mb-6">
          <div className="space-y-1">
            <p>📍 {siteConfig.contact.address}</p>
            <p>📞 {siteConfig.contact.phone}</p>
            <p>✉️ {siteConfig.contact.email}</p>
          </div>
          <div className="space-y-1">
            <p className="text-gray-300 font-medium">영업시간</p>
            <p>평일 {openHour}:00 ~ {closeHour}:00</p>
            <p>일요일 휴무</p>
          </div>
        </div>
        <p className="text-xs text-gray-600">© {new Date().getFullYear()} {siteConfig.name}. All rights reserved.</p>
      </div>
    </footer>
  );
}
