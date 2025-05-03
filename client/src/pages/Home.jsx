import React from "react";

import { Categories, Hero, PopularCourses, FeaturedVideos, Testimonials } from "../components";

const Home = () => {
  return (
    <div className="container mx-auto">
      <Hero />
      <Categories />
      <FeaturedVideos />
      <PopularCourses />
      <Testimonials />
    </div>
  );
};

export default Home;
