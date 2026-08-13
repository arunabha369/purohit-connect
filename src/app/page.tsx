import { AppShell } from "@/components/layout/app-shell";
import { SearchHero } from "@/components/home/search-hero";
import { CategoryGrid } from "@/components/home/category-grid";
import { BannerCarousel } from "@/components/home/banner-carousel";
import { PopularServices } from "@/components/home/popular-services";
import { PurohitCards } from "@/components/home/purohit-cards";

export default function HomePage() {
  return (
    <AppShell>
      <SearchHero />
      <BannerCarousel />
      <CategoryGrid />
      <PopularServices />
      <PurohitCards />

      {/* Footer */}
      <footer className="bg-charcoal text-cream-200 px-4 py-12 mt-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h4 className="font-heading font-bold text-white text-lg mb-4">
              Purohit<span className="text-saffron-400">Connect</span>
            </h4>
            <p className="text-sm text-cream-400 leading-relaxed">
              India&apos;s trusted platform for booking verified purohits for all
              Vedic ceremonies and rituals.
            </p>
          </div>
          <div>
            <h5 className="font-semibold text-white text-sm mb-3">Services</h5>
            <ul className="space-y-2 text-sm text-cream-400">
              <li>Griha Pravesh</li>
              <li>Wedding Ceremony</li>
              <li>Satyanarayan Puja</li>
              <li>Havan / Homam</li>
            </ul>
          </div>
          <div>
            <h5 className="font-semibold text-white text-sm mb-3">Company</h5>
            <ul className="space-y-2 text-sm text-cream-400">
              <li>About Us</li>
              <li>Careers</li>
              <li>Blog</li>
              <li>Contact</li>
            </ul>
          </div>
          <div>
            <h5 className="font-semibold text-white text-sm mb-3">Support</h5>
            <ul className="space-y-2 text-sm text-cream-400">
              <li>Help Center</li>
              <li>Safety</li>
              <li>Terms of Service</li>
              <li>Privacy Policy</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-white/10 text-center text-xs text-cream-400">
          © 2025 PurohitConnect. All rights reserved. Made with 🙏 in India.
        </div>
      </footer>
    </AppShell>
  );
}
