import React, { useState, useEffect } from "react";
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaLinkedin, FaTwitter, FaGraduationCap, FaBriefcase, FaChalkboardTeacher } from "react-icons/fa";
import { motion } from "framer-motion";
import { tutorAPI } from "../services/api";

const ContactPage = () => {
  // State for tutors
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch tutors on component mount
  useEffect(() => {
    const fetchTutors = async () => {
      setLoading(true);
      try {
        const response = await tutorAPI.getApprovedTutors();
        setTutors(response.data.data.tutors);
      } catch (err) {
        console.error("Error fetching tutors:", err);
        setError("Failed to load tutors. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchTutors();
  }, []);

  // Team members data
  const teamMembers = [
    {
      name: "Musavir Khaliq",
      role: "Founder",
      bio: "Visionary leader behind Educasheer, dedicated to transforming education in Kashmir.",
      image: "/images/team/musavir.jpg", // Replace with actual image path
      social: {
        linkedin: "#",
        twitter: "#"
      }
    },
    {
      name: "Mohsin Urfie",
      role: "Co-Founder",
      bio: "Educational innovator helping shape the future of learning through technology.",
      image: "/images/team/mohsin.jpg", // Replace with actual image path
      social: {
        linkedin: "#",
        twitter: "#"
      }
    },
    {
      name: "Dr. Chandana Barat",
      role: "Academic Advisor",
      bio: "Experienced educator providing guidance on curriculum development and teaching methodologies.",
      image: "/images/team/chandana.jpg", // Replace with actual image path
      social: {
        linkedin: "#",
        twitter: "#"
      }
    },
    {
      name: "Sanmit",
      role: "Technology Lead",
      bio: "Tech enthusiast driving the digital transformation of educational experiences.",
      image: "/images/team/sanmit.jpg", // Replace with actual image path
      social: {
        linkedin: "#",
        twitter: "#"
      }
    },
    {
      name: "Rukhsana Masrat",
      role: "Educational Consultant",
      bio: "Passionate about creating inclusive learning environments for students of all backgrounds.",
      image: "/images/team/rukhsana.jpg", // Replace with actual image path
      social: {
        linkedin: "#",
        twitter: "#"
      }
    },
    {
      name: "Safeena",
      role: "Community Outreach",
      bio: "Building bridges between Educasheer and local communities to expand educational access.",
      image: "/images/team/safeena.jpg", // Replace with actual image path
      social: {
        linkedin: "#",
        twitter: "#"
      }
    },
    {
      name: "Ab Khaliq",
      role: "Strategic Advisor",
      bio: "Providing strategic direction to help Educasheer achieve its educational mission.",
      image: "/images/team/abkhaliq.jpg", // Replace with actual image path
      social: {
        linkedin: "#",
        twitter: "#"
      }
    }
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[#00bcd4] to-[#01427a]">
          Contact Us
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Connect with Educasheer to learn more about our mission to transform education
          and make a positive impact on students' lives.
        </p>
      </div>

      {/* Mission Section */}
      <div className="max-w-4xl mx-auto mb-20">
        <div className="glass-card p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-primary-100/30 to-primary-300/20 rounded-full blur-3xl -z-10"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-secondary-100/20 to-secondary-300/10 rounded-full blur-3xl -z-10"></div>

          <h2 className="text-3xl font-bold mb-6 inline-block relative">
            Our Mission
            <span className="absolute bottom-0 left-0 w-1/3 h-1 bg-[#01427a] rounded-full"></span>
          </h2>

          <p className="text-gray-700 mb-6 leading-relaxed">
            At Educasheer, we are dedicated to reinventing education to make humans more human, not just to serve capitalism.
            We believe in the transformative power of education that nurtures both intellectual growth and moral values.
          </p>

          <p className="text-gray-700 mb-6 leading-relaxed">
            Our mission is to provide accessible, quality education that empowers students to think critically,
            develop practical skills, and contribute meaningfully to society. Through our innovative online platform
            and offline learning centers, we create spaces where students can reinvent concepts for themselves.
          </p>

          <p className="text-gray-700 leading-relaxed">
            We are committed to bridging educational gaps in Kashmir and beyond, bringing world-class learning
            opportunities to communities that have historically had limited access to quality education.
          </p>
        </div>
      </div>

      {/* Team Section */}
      <div className="mb-20">
        <h2 className="text-3xl font-bold text-center mb-12 inline-block relative">
          Meet Our Team
          <span className="absolute bottom-0 left-0 w-1/3 h-1 bg-[#01427a] rounded-full"></span>
        </h2>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {teamMembers.map((member, index) => (
            <motion.div
              key={index}
              className="glass-card p-6 flex flex-col items-center text-center"
              variants={itemVariants}
            >
              <div className="w-32 h-32 rounded-full overflow-hidden mb-4 border-4 border-white shadow-md">
                {member.image ? (
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://via.placeholder.com/150?text=" + member.name.charAt(0);
                    }}
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-gradient-to-r from-[#00bcd4] to-[#01427a] flex items-center justify-center text-white text-4xl">
                    {member.name.charAt(0)}
                  </div>
                )}
              </div>

              <h3 className="text-xl font-bold text-gray-800 mb-1">{member.name}</h3>
              <p className="text-primary-600 font-medium mb-3">{member.role}</p>
              <p className="text-gray-600 mb-4 text-sm">{member.bio}</p>

              <div className="flex space-x-3 mt-auto">
                <a
                  href={member.social.linkedin}
                  className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-[#0077B5] hover:text-white transition-colors"
                  aria-label={`${member.name}'s LinkedIn`}
                >
                  <FaLinkedin />
                </a>
                <a
                  href={member.social.twitter}
                  className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-[#1DA1F2] hover:text-white transition-colors"
                  aria-label={`${member.name}'s Twitter`}
                >
                  <FaTwitter />
                </a>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Tutors Section */}
      {tutors.length > 0 && (
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12 inline-block relative">
            Meet Our Educators
            <span className="absolute bottom-0 left-0 w-1/3 h-1 bg-[#01427a] rounded-full"></span>
          </h2>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {tutors.map((tutor) => (
              <motion.div
                key={tutor._id}
                className="glass-card p-6 flex flex-col items-center text-center"
                variants={itemVariants}
              >
                <div className="w-32 h-32 rounded-full overflow-hidden mb-4 border-4 border-white shadow-md">
                  {tutor.avatar ? (
                    <img
                      src={tutor.avatar}
                      alt={tutor.fullName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://via.placeholder.com/150?text=" + tutor.fullName.charAt(0);
                      }}
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gradient-to-r from-[#00bcd4] to-[#01427a] flex items-center justify-center text-white text-4xl">
                      {tutor.fullName.charAt(0)}
                    </div>
                  )}
                </div>

                <h3 className="text-xl font-bold text-gray-800 mb-1">{tutor.fullName}</h3>
                <p className="text-primary-600 font-medium mb-3">Tutor</p>

                <div className="flex items-center mb-2">
                  <FaGraduationCap className="text-primary-600 mr-2" />
                  <p className="text-gray-700 text-sm">{tutor.qualifications || "Qualified Educator"}</p>
                </div>

                {tutor.specialization && (
                  <div className="flex items-center mb-2">
                    <FaChalkboardTeacher className="text-primary-600 mr-2" />
                    <p className="text-gray-700 text-sm">{tutor.specialization}</p>
                  </div>
                )}

                {tutor.experience && (
                  <div className="flex items-center mb-4">
                    <FaBriefcase className="text-primary-600 mr-2" />
                    <p className="text-gray-700 text-sm">{tutor.experience}</p>
                  </div>
                )}

                <a
                  href={`mailto:${tutor.email}`}
                  className="mt-3 text-primary-600 hover:text-primary-700 font-medium"
                >
                  Contact Tutor
                </a>
              </motion.div>
            ))}
          </motion.div>

          {loading && (
            <div className="text-center py-8">
              <p className="text-gray-600">Loading tutors...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <p className="text-red-500">{error}</p>
            </div>
          )}
        </div>
      )}

      {/* Contact Information */}
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12 inline-block relative">
          Get In Touch
          <span className="absolute bottom-0 left-0 w-1/3 h-1 bg-[#01427a] rounded-full"></span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="glass-card p-6 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 mb-4">
              <FaMapMarkerAlt className="text-2xl" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Visit Us</h3>
            <p className="text-gray-600">New Colony, Jahangeerpora Baramulla</p>
            <a
              href="https://maps.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 text-primary-600 hover:text-primary-700 font-medium"
            >
              View on Map
            </a>
          </div>

          <div className="glass-card p-6 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 mb-4">
              <FaPhone className="text-2xl" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Call Us</h3>
            <p className="text-gray-600">+91 8825063816</p>
            <a
              href="tel:+918825063816"
              className="mt-3 text-primary-600 hover:text-primary-700 font-medium"
            >
              Call Now
            </a>
          </div>

          <div className="glass-card p-6 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 mb-4">
              <FaEnvelope className="text-2xl" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Email Us</h3>
            <p className="text-gray-600">educasheer21@gmail.com</p>
            <a
              href="mailto:educasheer21@gmail.com"
              className="mt-3 text-primary-600 hover:text-primary-700 font-medium"
            >
              Send Email
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
