"use client";

import Header from "../components/Header";
import Hero from "../components/Hero";
import MenuSection from "../components/MenuSection";
import TastesSection from "../components/TastesSection";
import ArtOfBread from "../components/ArtOfBread";
import FeaturesSection from "../components/FeaturesSection";
import Footer from "../components/Footer";
import FeedbackModal from "../components/FeedbackModal";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Hero />
        <MenuSection />
        <TastesSection />
        <ArtOfBread />
        <FeaturesSection />
        <Footer />
        <FeedbackModal />
      </main>
    </div>
  );
}