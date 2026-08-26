"use client";

import { DashboardProvider } from "@/context/ElectionContext";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroFilter from "@/components/home/HeroFilter";
import MetricCards from "@/components/home/MetricCards";
import MapSection from "@/components/home/MapSection";
import PollTrendSection from "@/components/home/PollTrendSection";
import PartyMapSection from "@/components/home/PartyMapSection";
import CountyTable from "@/components/home/CountyTable";
import Methodology from "@/components/home/Methodology";
import CountyDrawer from "@/components/drawer/CountyDrawer";

function DashboardContent() {
  return (
    <main id="main-content">
      <HeroFilter />
      <MetricCards />
      <MapSection />
      <CountyTable />
      <PollTrendSection />
      <PartyMapSection />
      <Methodology />
      <div className="h-16" aria-hidden="true" />
    </main>
  );
}

export default function Page() {
  return (
    <DashboardProvider>
      <Navbar />
      <DashboardContent />
      <Footer />
      <CountyDrawer />
    </DashboardProvider>
  );
}
