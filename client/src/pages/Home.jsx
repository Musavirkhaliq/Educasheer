import React from "react";

import { Categories, Hero, PopularCourses, FeaturedVideos, LearningCenters, Testimonials } from "../components";

const Home = () => {
  return (
    <div className="container mx-auto px-4 sm:px-6 md:px-8 pb-16 sm:pb-0">
      <Hero />
      <Categories />
      <FeaturedVideos />
      <PopularCourses />
      <LearningCenters />
      <Testimonials />
    </div>
  );
};

export default Home;