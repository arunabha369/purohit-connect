import { AppShell } from "@/components/layout/app-shell";
import { SearchHero } from "@/components/home/search-hero";
import { CategoryGrid } from "@/components/home/category-grid";
import { PopularServices } from "@/components/home/popular-services";
import { PurohitCards } from "@/components/home/purohit-cards";
import {
  HowItWorks,
  JoinCta,
  Offers,
  Testimonials,
  WhyUs,
} from "@/components/home/home-sections";

export default function HomePage() {
  return (
    <AppShell footer>
      <SearchHero />
      <Offers />
      <CategoryGrid />
      <PopularServices />
      <HowItWorks />
      <PurohitCards />
      <WhyUs />
      <Testimonials />
      <JoinCta />
    </AppShell>
  );
}
