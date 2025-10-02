import React from "react";

import { Categories, Hero, PopularCourses, FeaturedVideos, LearningCenters, Testimonials, HomeLeaderboard, FeaturedTestSeries } from "../components";

const Home = () => {
  return (
    <div className="container mx-auto px-4 sm:px-6 md:px-8 pb-16 sm:pb-0">
      <Hero />
      <FeaturedTestSeries />
      <Categories />
      <FeaturedVideos />
      <HomeLeaderboard />
      <PopularCourses />
      <LearningCenters />
      <Testimonials />
    </div>
  );
};

export default Home;