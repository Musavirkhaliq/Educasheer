import React from "react";
import { Link } from "react-router-dom";
import {
  FaFacebook,
  FaTwitter,
  FaLinkedin,
  FaGithub,
  FaAngleUp,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
  FaGraduationCap,
} from "react-icons/fa";
import { motion } from "framer-motion";

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const quickLinks = [
    { name: "Home", path: "/" },
    { name: "Videos", path: "/videos" },
    { name: "Courses", path: "/courses" },
    { name: "Exams", path: "/exams" },
    { name: "Blogs", path: "/blogs" },
    { name: "Categories", path: "/videos" },
    { name: "Study Material", path: "/" },
    { name: "Contact Us", path: "/contact" },
  ];

  const socialLinks = [
    { icon: FaFacebook, name: "Facebook", url: "#", color: "hover:bg-blue-600" },
    { icon: FaTwitter, name: "Twitter", url: "#", color: "hover:bg-sky-500" },
    { icon: FaLinkedin, name: "LinkedIn", url: "#", color: "hover:bg-blue-700" },
    { icon: FaGithub, name: "GitHub", url: "#", color: "hover:bg-gray-800" },
  ];

  const contactInfo = [
    {
      icon: FaMapMarkerAlt,
      content: "New Colony, Jahangeerpora Baramulla",
      url: "https://maps.google.com"
    },
    {
      icon: FaPhoneAlt,
      content: "+91 8825063816",
      url: "tel:+8825063816"
    },
    {
      icon: FaEnvelope,
      content: "educasheer21@gmail.com",
      url: "educasheer21@gmail.com"
    },
  ];

  return (
    <footer className="relative bg-gradient-to-br from-[#01427a] to-[#0a2540] text-white pt-16 pb-8 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-10 right-10 w-64 h-64 bg-[#00bcd4]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-64 h-64 bg-[#00bcd4]/5 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
          {/* Logo and About Section */}
          <div className="lg:col-span-4">
            <div className="flex items-center mb-6">
              <div className="bg-gradient-to-r from-[#00bcd4] to-[#01427a]/80 text-white font-bold text-2xl px-3 py-1 rounded-lg mr-2">EC</div>
              <span className="text-xl font-bold text-white">EduCasheer</span>
            </div>

            <p className="text-gray-300 mb-6 max-w-md">
              Reinventing education to make humans more human, not just to serve capitalism.
              We help students reinvent concepts for themselves through our online and offline courses.
            </p>

            <div className="flex space-x-3">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  aria-label={social.name}
                  className={`w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:text-white ${social.color} transition-all duration-300`}
                >
                  <social.icon />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-3">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
              <span className="w-8 h-0.5 bg-[#00bcd4] mr-3"></span>
              Quick Links
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.path}
                    className="text-gray-300 hover:text-[#00bcd4] transition-colors duration-300 flex items-center"
                  >
                    <span className="mr-2">→</span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Information */}
          <div className="lg:col-span-3">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
              <span className="w-8 h-0.5 bg-[#00bcd4] mr-3"></span>
              Contact Us
            </h3>
            <ul className="space-y-4">
              {contactInfo.map((info, index) => (
                <li key={index}>
                  <a
                    href={info.url}
                    className="flex items-start text-gray-300 hover:text-[#00bcd4] transition-colors duration-300"
                  >
                    <span className="mr-3 mt-1 text-[#00bcd4]">
                      <info.icon />
                    </span>
                    <span>{info.content}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter Section */}
          <div className="lg:col-span-2">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
              <span className="w-8 h-0.5 bg-[#00bcd4] mr-3"></span>
              Newsletter
            </h3>
            <p className="text-gray-300 mb-4 text-sm">
              Subscribe to our newsletter for the latest updates and educational resources.
            </p>
            <div className="flex flex-col space-y-3">
              <div className="relative">
                <input
                  type="email"
                  placeholder="Your email"
                  className="w-full px-4 py-3 bg-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00bcd4] transition-all duration-300"
                />
                <button className="absolute right-1 top-1 bg-gradient-to-r from-[#00bcd4] to-[#01427a] text-white p-2 rounded-lg hover:shadow-lg transition-all duration-300">
                  <FaEnvelope />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-gray-500/30 to-transparent my-10"></div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <FaGraduationCap className="text-[#00bcd4] mr-2" />
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} EduCasheer. All rights reserved.
            </p>
          </div>

          <div className="flex space-x-6">
            <Link to="/privacy" className="text-gray-400 hover:text-[#00bcd4] text-sm transition-colors duration-300">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-gray-400 hover:text-[#00bcd4] text-sm transition-colors duration-300">
              Terms of Service
            </Link>
            <button
              onClick={scrollToTop}
              aria-label="Scroll to top"
              className="bg-white/10 p-2 rounded-full hover:bg-[#00bcd4] transition-all duration-300 ml-2"
            >
              <FaAngleUp className="text-white" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
