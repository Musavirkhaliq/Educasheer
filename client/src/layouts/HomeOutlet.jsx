import React, { useEffect, useState } from "react";
import { Outlet, ScrollRestoration } from "react-router-dom";
import Header from "../shared/Header";
import Footer from "../shared/Footer";
import { motion, AnimatePresence } from "framer-motion";

const HomeOutlet = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-hero-pattern">
      {/* Background Elements */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-white via-gray-50 to-blue-50 opacity-90"></div>

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

      <ScrollRestoration />
      <Header />
      <AnimatePresence mode="wait">
        <motion.main
          className="flex-grow"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
        >
          <Outlet />
        </motion.main>
      </AnimatePresence>
      <Footer />
    </div>
  );
};

export default HomeOutlet;
