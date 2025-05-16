import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaStar, FaQuoteLeft, FaQuoteRight, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { testimonialAPI } from "../../services/api";
import { motion } from "framer-motion";

const Testimonials = ({ limit = 6, showAddButton = true }) => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const testimonialsPerPage = 3;

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await testimonialAPI.getApprovedTestimonials({ limit });
        console.log("Approved testimonials response:", response);

        // Handle both possible response formats
        const fetchedTestimonials = Array.isArray(response.data)
          ? response.data
          : (response.data.testimonials || []);

        console.log("Fetched approved testimonials:", fetchedTestimonials);
        setTestimonials(fetchedTestimonials);
        setError(""); // Clear any previous errors
      } catch (error) {
        console.error("Error fetching testimonials:", error);
        setError("Failed to load testimonials");
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, [limit]);

  // Use actual testimonials from the API
  const displayTestimonials = testimonials;

  const totalPages = Math.ceil(displayTestimonials.length / testimonialsPerPage);
  const currentTestimonials = displayTestimonials.slice(
    currentPage * testimonialsPerPage,
    (currentPage + 1) * testimonialsPerPage
  );

  const nextPage = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };

  const prevPage = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00bcd4]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">What Our Students Say</h2>
        </div>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 max-w-2xl mx-auto">
          {error}
        </div>
        {showAddButton && (
          <div className="text-center mt-6">
            <Link
              to="/testimonials/add"
              className="inline-block bg-gradient-to-r from-[#00bcd4] to-[#01427a] text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-300"
            >
              Share Your Experience
            </Link>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="py-12">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">What Our Students Say</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Hear from our community of learners about their experiences with EduCasheer
        </p>
      </div>

      <div className="relative max-w-6xl mx-auto px-4">
        {/* Navigation buttons */}
        {totalPages > 1 && (
          <>
            <button
              onClick={prevPage}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition-colors"
              aria-label="Previous testimonials"
            >
              <FaChevronLeft className="text-[#01427a]" />
            </button>
            <button
              onClick={nextPage}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition-colors"
              aria-label="Next testimonials"
            >
              <FaChevronRight className="text-[#01427a]" />
            </button>
          </>
        )}

        {/* Testimonials grid */}
        {displayTestimonials.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-gray-700 mb-4">No testimonials available yet. Be the first to share your experience!</p>
            {showAddButton && (
              <Link
                to="/testimonials/add"
                className="inline-block bg-gradient-to-r from-[#00bcd4] to-[#01427a] text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-300"
              >
                Share Your Experience
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {currentTestimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-sm p-6 relative"
              >
                <div className="absolute -top-3 -left-3 text-[#00bcd4] opacity-20">
                  <FaQuoteLeft size={24} />
                </div>
                <div className="mb-4 flex">
                  {[...Array(5)].map((_, i) => (
                    <FaStar
                      key={i}
                      className={`${
                        i < (testimonial.rating || 5)
                          ? "text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-gray-700 italic mb-4">"{testimonial.content}"</p>
                <p className="text-[#01427a] font-medium">
                  – {testimonial.authorName}
                </p>
                <div className="absolute -bottom-3 -right-3 text-[#00bcd4] opacity-20">
                  <FaQuoteRight size={24} />
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination dots - only show when there are testimonials */}
        {displayTestimonials.length > 0 && totalPages > 1 && (
          <div className="flex justify-center mt-8">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i)}
                className={`mx-1 h-2 w-2 rounded-full ${
                  currentPage === i ? "bg-[#00bcd4]" : "bg-gray-300"
                }`}
                aria-label={`Go to page ${i + 1}`}
              />
            ))}
          </div>
        )}

        {/* Add testimonial button - only show when not already shown in empty state */}
        {showAddButton && displayTestimonials.length > 0 && (
          <div className="text-center mt-10">
            <Link
              to="/testimonials/add"
              className="inline-block bg-gradient-to-r from-[#00bcd4] to-[#01427a] text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-300"
            >
              Share Your Experience
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Testimonials;
