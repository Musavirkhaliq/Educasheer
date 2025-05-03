import { FaCar, FaHotel, FaVideo, FaGraduationCap } from "react-icons/fa6";
import { GiMountainRoad } from "react-icons/gi";
import {
  MapPin,
  Building2,
  Car,
  DollarSign,
  FileEdit,
  PenTool,
  ShoppingBag,
  BookOpen,
  Receipt,
} from "lucide-react";
import { FaHome, FaLayerGroup, FaMapMarkerAlt } from "react-icons/fa";
import { MdNotifications } from "react-icons/md";

const navLinks = [
  {
    name: "Home",
    address: "/",
    icon: <FaHome />,
  },
  {
    name: "Videos",
    address: "/videos",
    icon: <FaVideo />,
  },
  {
    name: "Courses",
    address: "/courses",
    icon: <FaGraduationCap />,
  },
  {
    name: "Programs",
    address: "/programs",
    icon: <FaLayerGroup />,
  },
  {
    name: "Centers",
    address: "/centers",
    icon: <FaMapMarkerAlt />,
  },
  {
    name: "Categories",
    address: "/videos",
    icon: <BookOpen />,
  },
  {
    name: "Study Material",
    address: "/",
    icon: <FaHotel />,
  },
  {
    name: "Contact Us",
    address: "/",
    icon: <FaCar />,
  },
];

const quickLinks = [
  {
    name: "Blogs",
    address: "/blog-grid",
  },
  {
    name: "About Us",
    address: "/about",
  },
  {
    name: "Contact Us",
    address: "/contact",
  },
  {
    name: "Destinations",
    address: "/all-destinations",
  },
];
const adminLinks = [
  {
    name: "Dashboard",
    address: "dashboard",
    icon: <MdNotifications />,
  },
  {
    name: "Manage Users",
    address: "users",
    icon: <MapPin />,
  },
  {
    name: "Fee Management",
    address: "fees",
    icon: <Receipt />,
  },
  {
    name: "Manage Videos",
    address: "videos",
    icon: <FaVideo />,
  },
  {
    name: "Manage Courses",
    address: "courses",
    icon: <FaGraduationCap />,
  },
  {
    name: "Manage Programs",
    address: "programs",
    icon: <FaLayerGroup />,
  },
  {
    name: "Manage Centers",
    address: "centers",
    icon: <FaMapMarkerAlt />,
  },
  {
    name: "Tutor Applications",
    address: "tutor-applications",
    icon: <FileEdit />,
  },
  {
    name: "Add Video",
    address: "/videos/upload",
    icon: <FaVideo />,
  },
  {
    name: "Create Course",
    address: "/courses/create",
    icon: <FaGraduationCap />,
  },
  {
    name: "Create Program",
    address: "/programs/create",
    icon: <FaLayerGroup />,
  },
  {
    name: "Create Center",
    address: "/centers/create",
    icon: <FaMapMarkerAlt />,
  },
];

const pakageLinks = [
  {
    name: "Overview",
    address: ".",
    icon: <PenTool />,
  },
  {
    name: "Iterinary",
    address: "iterinary",
    icon: <ShoppingBag />,
  },
  {
    name: "hotels and destinations",
    address: "more",
  },
  {
    name: "Inclusions & Exclusions",
    address: "inclusions-and-exclusions",
  },
];

export { quickLinks, navLinks, adminLinks, pakageLinks };
