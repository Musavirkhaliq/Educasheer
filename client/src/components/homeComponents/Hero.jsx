import React, { useState, useEffect } from "react";
import { FaSearch, FaGraduationCap, FaUsers, FaStar, FaArrowRight } from "react-icons/fa";
import { motion } from "framer-motion";

const Hero = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Animation variants for consistent animations
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (delay) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, delay }
    })
  };

  // Common data structures for repeating elements
  const stats = [
    { icon: FaGraduationCap, count: "50+", label: "Offline & Online Courses" },
    { icon: FaUsers, count: "1,000+", label: "Expert Mentors" },
    { icon: FaStar, count: "100%", label: "Human-Centered" },
  ];

  const featureCards = [
    {
      title: "EduCasheer SiliconSpark",
      description: "Cutting-edge computing labs with AI and CS equipment",
      action: "Find a Center",
      icon: FaGraduationCap,
      color: "primary",
    },
    {
      title: "EduCasheer Hikmah Lounge",
      description: "Comfortable learning spaces with comprehensive resources",
      action: "Find a Center",
      icon: FaGraduationCap,
      color: "blue-600",
    },
    {
      title: "Expert Counseling",
      description: "Connect with JEE/GATE/USPC/JKSSB toppers, scientists, and researchers",
      action: "Watch Sessions",
      icon: FaUsers,
      color: "secondary",
    },
    {
      title: "CS & AI Courses", 
      description: "Cutting-edge curriculum in computer science, AI, machine learning & more",
      action: "Explore Courses",
      icon: FaStar,
      color: "green-600",
    },
  ];

  const counselingSessions = [
    {
      title: "JEE Preparation",
      description: "Learn from AIR top 100 rankers with personalized strategies for JEE Main & Advanced",
      category: "JEE Main & Advanced",
      icon: FaGraduationCap,
      color: "primary",
      link: "#jee-sessions"
    },
    {
      title: "NEET Preparation",
      description: "Expert guidance from medical professionals and NEET top rankers",
      category: "Medical Entrance",
      icon: FaUsers,
      color: "green-600",
      link: "#neet-sessions"
    },
    {
      title: "UPSC Guidance",
      description: "Strategic preparation advice from IAS officers and successful candidates",
      category: "Civil Services",
      icon: FaStar,
      color: "secondary",
      link: "#upsc-sessions"
    },
    {
      title: "GATE Coaching",
      description: "Specialized guidance for all engineering disciplines from GATE toppers",
      category: "Engineering PG",
      icon: FaGraduationCap,
      color: "purple-600",
      link: "#gate-sessions"
    }
  ];

  const specializedSessions = [
    { title: "Research Mentorship", link: "#research-mentorship" },
    { title: "Career Guidance", link: "#career-guidance" },
    { title: "Study Abroad", link: "#study-abroad" },
    { title: "Programming", link: "#programming" },
    { title: "AI & ML", link: "#ai-ml" },
    { title: "View All", link: "#all-sessions", highlight: true }
  ];

  const centers = [
    {
      name: "Educasheers SiliconSpark",
      description: "Cutting-edge computing labs with specialized AI and CS equipment. Perfect for hands-on learning and practical skill development.",
      image: "https://images.unsplash.com/photo-1581092921461-39b9d08a9b21?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80",
      badge: "15+ Centers",
      badgeColor: "primary",
      features: [
        { icon: FaGraduationCap, text: "Advanced computing hardware", iconBg: "green-100", iconColor: "green-600" },
        { icon: FaUsers, text: "Small batch sizes (max 15 students)", iconBg: "blue-100", iconColor: "blue-600" }
      ],
      actionText: "Find a SiliconSpark Center",
      actionLink: "#silicon-spark",
      actionColor: "primary"
    },
    {
      name: "Educasheer Hikmah Learning Lounge",
      description: "Comfortable learning spaces with comprehensive study resources. Designed for focused learning and collaborative projects.",
      image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1471&q=80",
      badge: "10+ Centers",
      badgeColor: "secondary",
      features: [
        { icon: FaStar, text: "Extensive library resources", iconBg: "purple-100", iconColor: "purple-600" },
        { icon: FaGraduationCap, text: "Quiet study and group work areas", iconBg: "green-100", iconColor: "green-600" }
      ],
      actionText: "Find a Hikmah Learning Lounge",
      actionLink: "#hikmah-lounge",
      actionColor: "secondary"
    }
  ];

  // Reusable component for link with arrow
  const ArrowLink = ({ href, text, color = "primary" }) => (
    <a href={href} className={`text-${color} text-sm font-medium hover:underline flex items-center`}>
      {text} <FaArrowRight className="ml-1 text-xs" />
    </a>
  );

  // Reusable component for icon circles
  const IconCircle = ({ Icon, color, size = "md", className = "" }) => {
    const sizes = {
      sm: "w-5 h-5",
      md: "w-10 h-10",
      lg: "w-12 h-12"
    };
    
    return (
      <div className={`${sizes[size]} rounded-full bg-${color}/10 flex items-center justify-center ${className}`}>
        <Icon className={`text-${color} ${size === "lg" ? "text-xl" : ""}`} />
      </div>
    );
  };

  return (
    <div className="relative overflow-hidden py-12 sm:py-16 md:py-20">
      {/* Minimalist Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-white to-blue-50 opacity-90 z-0">
        <div className="absolute top-0 right-0 w-1/3 h-1 bg-primary"></div>
        <div className="absolute bottom-0 left-0 w-1/3 h-1 bg-secondary"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10 max-w-5xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <motion.h1
            custom={0.3}
            initial="hidden"
            animate={isVisible ? "visible" : "hidden"}
            variants={fadeInUp}
            className="text-4xl sm:text-5xl md:text-6xl font-bold text-[#0c0c0d] leading-tight mb-4"
          >
            Reinventing <span className="text-primary">Education</span> for <span className="text-secondary">Humanity</span>
          </motion.h1>

          <motion.p
            custom={0.4}
            initial="hidden"
            animate={isVisible ? "visible" : "hidden"}
            variants={fadeInUp}
            className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-8"
          >
            We believe in education that helps students reinvent concepts for themselves, not just serve capitalism. Explore our online and offline courses in computer science, AI, and more.
          </motion.p>

          {/* Search Bar */}
          <motion.div
            custom={0.5}
            initial="hidden"
            animate={isVisible ? "visible" : "hidden"}
            variants={fadeInUp}
            className="relative max-w-2xl mx-auto mb-12"
          >
            <div className="flex">
              <input
                type="text"
                placeholder="Search for courses, skills, or topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-6 py-4 rounded-l-md border-none bg-white focus:outline-none focus:ring-1 focus:ring-primary pl-12 shadow-sm"
              />
              <button className="bg-primary text-white px-6 py-4 rounded-r-md font-medium hover:bg-primary/90 transition-all duration-300 flex items-center justify-center">
                Search
              </button>
            </div>
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
              <FaSearch />
            </div>
          </motion.div>
        </div>

        {/* Feature Cards */}
        <motion.div
          custom={0.6}
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
          variants={fadeInUp}
          className="grid grid-cols-1 md:grid-cols-4 gap-6"
        >
          {featureCards.map((card, index) => (
            <div key={index} className="bg-white p-6 rounded-md shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center mb-4">
                <IconCircle Icon={card.icon} color={card.color} className="mr-3" />
                <h3 className="font-bold text-lg">{card.title}</h3>
              </div>
              <p className="text-gray-600 text-sm mb-4">{card.description}</p>
              <ArrowLink href="#" text={card.action} color={card.color} />
            </div>
          ))}
        </motion.div>

        {/* Stats */}
        <motion.div
          custom={0.7}
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
          variants={fadeInUp}
          className="flex flex-wrap justify-center gap-8 mt-12 pt-8 border-t border-gray-100"
        >
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="font-bold text-2xl text-gray-800">{stat.count}</div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* CTA Button */}
        <motion.div
          custom={0.8}
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
          variants={fadeInUp}
          className="text-center mt-12"
        >
          <a href="#" className="inline-block bg-primary text-white px-8 py-3 rounded-md font-medium hover:bg-primary/90 transition-all duration-300">
            Get Started
          </a>
        </motion.div>
      </div>

      {/* Expert Counseling Section */}
      <div className="container mx-auto px-4 sm:px-6 mt-16 relative z-10 max-w-5xl">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-gray-800">Expert Counseling Sessions</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">Connect with JEE toppers, GATE toppers, scientists, and researchers from around the world for personalized guidance in your educational journey.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {counselingSessions.map((session, index) => (
            <div key={index} className="bg-white p-5 rounded-md shadow-sm hover:shadow-md transition-shadow duration-300">
              <IconCircle Icon={session.icon} color={session.color} size="lg" className="mb-4 mx-auto" />
              <h3 className="font-bold text-lg mb-2 text-center">{session.title}</h3>
              <p className="text-sm text-gray-600 mb-4 text-center">{session.description}</p>
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-500">{session.category}</div>
                <ArrowLink href={session.link} text="View Sessions" color={session.color} />
              </div>
            </div>
          ))}
        </div>

        {/* Additional Session Types */}
        <div className="mt-8 bg-gray-50 p-5 rounded-md">
          <h3 className="font-bold text-lg mb-4">More Specialized Sessions</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {specializedSessions.map((session, index) => (
              <a 
                key={index} 
                href={session.link} 
                className={`${session.highlight ? 'bg-primary/10' : 'bg-white'} p-3 rounded-md text-center hover:shadow-sm transition-all duration-300`}
              >
                <div className={`text-sm font-medium ${session.highlight ? 'text-primary' : ''}`}>{session.title}</div>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Offline Centers Section */}
      <div className="container mx-auto px-4 sm:px-6 mt-16 mb-16 relative z-10 max-w-5xl">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-gray-800">Nationwide Learning Centers</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">Our Educasheer centers are expanding nationwide, offering state-of-the-art facilities and personalized learning experiences.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {centers.map((center, index) => (
            <motion.div
              key={index}
              className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-all duration-300"
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <div className="relative h-48">
                <img
                  src={center.image}
                  alt={center.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <div className="absolute bottom-4 left-4">
                  <span className={`bg-${center.badgeColor}/90 text-white text-xs px-3 py-1 rounded-full`}>
                    {center.badge}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">{center.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{center.description}</p>
                <ul className="space-y-2 mb-4">
                  {center.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-sm">
                      <span className={`w-5 h-5 rounded-full bg-${feature.iconBg} flex items-center justify-center mr-2`}>
                        <feature.icon className={`text-${feature.iconColor} text-xs`} />
                      </span>
                      <span>{feature.text}</span>
                    </li>
                  ))}
                </ul>
                <ArrowLink href={center.actionLink} text={center.actionText} color={center.actionColor} />
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-8">
          <a href="#all-centers" className="inline-block bg-primary text-white px-6 py-3 rounded-md font-medium hover:bg-primary/90 transition-all duration-300">
            View All Centers
          </a>
        </div>
      </div>
    </div>
  );
};

export default Hero;