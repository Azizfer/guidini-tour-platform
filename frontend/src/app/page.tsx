"use client"
import Header from "@/components/Header"
import { useEffect } from "react"
import HeroSection from "@/components/Hero"
import PopularDestinations from "@/app/Destinations/components/popular-destinations"
import PopularActivities from "@/app/Activities/components/popular-activities"
import PopularGuides from "@/app/guides/components/popular-guides"
import Footer from "@/components/footer"
import ScrollToTop from "@/components/scroll-to-top"
import ScrollProgress from "@/components/scroll-progress"
import ChatButton from "@/components/Chatbot"

export default function Home() {
  // Initialize smooth scroll behavior
  useEffect(() => {
    // Add smooth scrolling to the entire page
    document.documentElement.style.scrollBehavior = "smooth"

    return () => {
      document.documentElement.style.scrollBehavior = ""
    }
  }, [])

  return (
    <main className="relative">
      <Header />
      <HeroSection />

      {/* Scroll Progress Indicator */}
      <ScrollProgress />

      {/* Tourism components with scroll animations */}
      <div className="scroll-container">
        <section id="destinations" className="scroll-section">
          <PopularDestinations />
        </section>

        <section id="activities" className="scroll-section">
          <PopularActivities />
        </section>

        <section id="guides" className="scroll-section">
          <PopularGuides />
        </section>
      </div>

      <ScrollToTop />
      <ChatButton />
      <Footer />
    </main>
  )
}
