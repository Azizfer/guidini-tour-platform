import Header from '../components/Header';
import Hero from '../components/Hero';
import Footer from '../components/Footer';
import PopularGuides from "../components/PopularGuides"
import PopularActivities from "./Activities/components/PopularActivities"
import GlobalRating from "../components/GlobalRating"
import PopularDestinations from '@/components/PopularDestinations'; 

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
    </div>
    </ThemeProvider>
  );
}

export default App;