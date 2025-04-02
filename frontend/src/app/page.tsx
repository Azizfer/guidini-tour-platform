import Header from '../components/Header';
import Hero from '../components/Hero';
import Footer from '../components/Footer';
import PopularGuides from "../components/PopularGuides"
import ChatButton from "../components/ChatButton"
import PopularActivities from "./Activities/components/PopularActivities"
import PopularDestinations from "./Destinations/components/PopularDestinations"
import GlobalRating from "../components/GlobalRating"

import React from "react"; 
import {ThemeProvider} from 'next-themes';



function App(){
  return (
    <ThemeProvider attribute="class">
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Hero />        
        <PopularDestinations />
        <PopularActivities />
        <PopularGuides />
      </main>
      <GlobalRating />
      <Footer />
      <ChatButton />
    </div>
    </ThemeProvider>
  );
}

export default App;