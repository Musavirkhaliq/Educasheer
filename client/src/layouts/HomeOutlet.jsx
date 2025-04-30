import React, { useEffect, useState } from "react";
import { Outlet, ScrollRestoration } from "react-router-dom";
import Header from "../shared/Header";
import Footer from "../shared/Footer";
import { motion, AnimatePresence } from "framer-motion";

const HomeOutlet = () => {
  const [scrollY, setScrollY] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Check if the device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    checkMobile();

    // Add event listener for window resize
    window.addEventListener('resize', checkMobile);

    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Throttle scroll events for better performance
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-hero-pattern">
      {/* Background Elements */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-white via-gray-50 to-blue-50 opacity-90"></div>

      {/* Conditional rendering based on device type */}
      {!isMobile ? (
        // Desktop - full animations
        <>
          {/* Animated Blobs */}
          <div className="fixed top-0 right-0 -z-10">
            <motion.div
              className="w-[600px] h-[600px] rounded-full bg-gradient-to-br from-primary-100/30 to-primary-300/20 blur-3xl"
              animate={{
                x: [50, 150, 50],
                y: [0, 100, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </div>

          <div className="fixed bottom-0 left-0 -z-10">
            <motion.div
              className="w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-secondary-100/20 to-secondary-300/10 blur-3xl"
              animate={{
                x: [-50, -150, -50],
                y: [0, -100, 0],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 25,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </div>

          {/* Glass shine effect that moves on scroll */}
          <div
            className="fixed inset-0 -z-10 bg-glass-shine opacity-10"
            style={{
              transform: `translateY(${scrollY * 0.2}px)`,
              transition: 'transform 0.1s ease-out'
            }}
          ></div>
        </>
      ) : (
        // Mobile - static elements for better performance
        <>
          {/* Static blobs for mobile */}
          <div className="fixed top-0 right-0 -z-10">
            <div className="w-[300px] h-[300px] rounded-full bg-gradient-to-br from-primary-100/30 to-primary-300/20 blur-3xl"></div>
          </div>

          <div className="fixed bottom-0 left-0 -z-10">
            <div className="w-[250px] h-[250px] rounded-full bg-gradient-to-tr from-secondary-100/20 to-secondary-300/10 blur-3xl"></div>
          </div>

          {/* Static glass shine effect */}
          <div className="fixed inset-0 -z-10 bg-glass-shine opacity-10"></div>
        </>
      )}

      <ScrollRestoration />
      <Header />
      <AnimatePresence mode="wait">
        {!isMobile ? (
          // Desktop - full animations
          <motion.main
            className="flex-grow"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <Outlet />
          </motion.main>
        ) : (
          // Mobile - simpler animations for better performance
          <motion.main
            className="flex-grow"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.main>
        )}
      </AnimatePresence>
      <Footer />
    </div>
  );
};

export default HomeOutlet;
