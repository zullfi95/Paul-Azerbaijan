import Header from "../components/Header";
import Hero from "../components/Hero";
import MenuSection from "../components/MenuSection";
import TastesSection from "../components/TastesSection";
import ArtOfBread from "../components/ArtOfBread";
import FeaturesSection from "../components/FeaturesSection";
import Footer from "../components/Footer";
import FeedbackButton from "../components/FeedbackButton";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      <Hero />
      <MenuSection />
      <TastesSection />
      <ArtOfBread />
      <FeaturesSection />
      <Footer />
      <FeedbackButton />
    </main>
  );
}