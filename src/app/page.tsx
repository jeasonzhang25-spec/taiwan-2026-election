import { DashboardProvider } from "@/context/ElectionContext";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroFilter from "@/components/home/HeroFilter";
import MetricCards from "@/components/home/MetricCards";
import MapSection from "@/components/home/MapSection";
import CountyTable from "@/components/home/CountyTable";
import DeferredSections from "@/components/home/DeferredSections";
import TrustCenterSection from "@/components/home/TrustCenterSection";
import MetroPagesSection from "@/components/home/MetroPagesSection";
import CountyDrawer from "@/components/drawer/CountyDrawer";
import { getPollDataHealth } from "@/lib/data/health";

// 即使民調內容沒有變化，也定期重算資料是否已超過新鮮度門檻。
export const revalidate = 1800;

export default function Page() {
  const dataHealth = getPollDataHealth();

  return (
    <DashboardProvider>
      <Navbar dataStatus={dataHealth.status} checkedAt={dataHealth.checkedAt} />
      <main id="main-content">
      <HeroFilter />
      <MetricCards />
      <MapSection />
      <MetroPagesSection />
      <CountyTable />
      <TrustCenterSection />
      <DeferredSections />
      <div className="h-16" aria-hidden="true" />
      </main>
      <Footer />
      <CountyDrawer />
    </DashboardProvider>
  );
}
