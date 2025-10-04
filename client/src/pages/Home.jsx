import React from "react";
import { Categories, Hero, PopularCourses, FeaturedVideos, LearningCenters, Testimonials, HomeLeaderboard, FeaturedTestSeries } from "../components";
import EnhancedContainer from "../components/layout/EnhancedContainer";

const Home = () => {
  return (
    <div className="pb-16 sm:pb-0">
      {/* Hero Section - Full Width */}
      <EnhancedContainer maxWidth="11xl" padding="responsive">
        <Hero />
      </EnhancedContainer>

      {/* Main Content */}
      <EnhancedContainer 
        maxWidth="10xl" 
        padding="responsive"
        className="space-y-12 lg:space-y-16 xl:space-y-20"
      >
        <FeaturedTestSeries />
        <Categories />
        <FeaturedVideos />
        <HomeLeaderboard />
        <PopularCourses />
        <LearningCenters />
        <Testimonials />
      </EnhancedContainer>
    </div>
  );
};

export default Home;