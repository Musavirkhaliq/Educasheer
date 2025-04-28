import React from "react";

import { Categories, Hero, PopularCourses, FeaturedVideos } from "../components";

const Home = () => {
  return (
    <div className="container mx-auto">
      <Hero />
      <Categories />
      <FeaturedVideos />
      <PopularCourses />
    </div>
  );
};

export default Home;
