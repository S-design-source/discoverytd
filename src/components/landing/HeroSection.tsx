import Link from "next/link";
import { siteConfig } from "@/config/site";

export default function HeroSection() {
  return (
    <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20 px-4">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-4xl sm:text-5xl font-bold mb-4 leading-tight">
          {siteConfig.name}
        </h1>
        <p className="text-lg sm:text-xl text-blue-100 mb-8">
          {siteConfig.description}
        </p>
        <Link
          href="/booking"
          className="inline-block bg-white text-blue-700 font-bold px-8 py-4 rounded-2xl text-base hover:bg-blue-50 transition-colors shadow-lg"
        >
          지금 예약하기 →
        </Link>
      </div>
    </section>
  );
}
