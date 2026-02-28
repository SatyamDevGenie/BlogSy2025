import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import { FaPenFancy, FaUsers, FaRocket, FaLightbulb } from "react-icons/fa";
import AnimatedBackground from "../components/AnimatedBackground";

export default function About() {
  const darkMode = useSelector((state) => state.theme.darkMode);

  const features = [
    {
      icon: <FaPenFancy className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />,
      title: "Beautiful Writing",
      description:
        "Distraction-free editor with markdown support for focused writing.",
    },
    {
      icon: <FaUsers className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />,
      title: "Engaged Community",
      description: "Connect with passionate writers and curious readers.",
    },
    {
      icon: <FaRocket className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />,
      title: "Powerful Reach",
      description: "Get your content discovered by thousands daily.",
    },
    {
      icon: <FaLightbulb className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />,
      title: "Smart Insights",
      description: "Analytics to help grow your audience.",
    },
  ];

  return (
    <div
      className={`transition-colors duration-300 ${
        darkMode ? "bg-transparent" : "bg-transparent"
      }`}
    >
      <AnimatedBackground />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 md:py-16">
        {/* Hero Section */}
        <motion.section
          className="text-center mb-10 sm:mb-14 md:mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.h1
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 tracking-tight"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <span
              className={`block ${darkMode ? "text-white" : "text-gray-900"}`}
            >
              Share ideas and grow together
            </span>
          </motion.h1>

          <motion.p
            className="text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed mb-6 sm:mb-8 text-balance"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <span
              className={`font-semibold ${
                darkMode ? "text-indigo-400" : "text-indigo-600"
              }`}
            >
              BlogSy 2025
            </span>{" "}
            — where stories, blogs and ideas changes per seconds
          </motion.p>
        </motion.section>

        {/* Features Section */}
        <motion.section
          className="mb-10 sm:mb-14 md:mb-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4 lg:gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className={`p-5 sm:p-6 rounded-2xl border transition-all duration-300 hover:-translate-y-1 active:translate-y-0 ${
                  darkMode
                    ? "bg-gray-800/80 border-gray-700/60 hover:bg-gray-800 hover:border-gray-600"
                    : "bg-white/90 border-gray-200/80 hover:bg-white hover:border-gray-300 shadow-sm hover:shadow-md"
                }`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: index * 0.1 + 0.3 }}
                whileTap={{ scale: 0.98 }}
              >
                <div
                  className={`w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center mb-3 sm:mb-4 rounded-xl ${
                    darkMode
                      ? "bg-indigo-500/20 text-indigo-400"
                      : "bg-indigo-100 text-indigo-600"
                  }`}
                >
                  {feature.icon}
                </div>
                <h3
                  className={`text-base sm:text-lg font-bold mb-1.5 sm:mb-2 ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {feature.title}
                </h3>
                <p
                  className={`text-sm sm:text-base leading-relaxed ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <motion.div
          className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <a
            href="/trending"
            className={`w-full sm:w-auto text-center px-5 py-3 sm:px-6 sm:py-3.5 rounded-xl font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              darkMode
                ? "bg-indigo-600 hover:bg-indigo-500 text-white focus:ring-indigo-500 focus:ring-offset-gray-900"
                : "bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-indigo-500 focus:ring-offset-white"
            }`}
          >
            Explore Trending
          </a>
          <a
            href="/latest"
            className={`w-full sm:w-auto text-center px-5 py-3 sm:px-6 sm:py-3.5 rounded-xl font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 border ${
              darkMode
                ? "border-gray-600 bg-gray-800/80 hover:bg-gray-700 text-gray-200 focus:ring-gray-500 focus:ring-offset-gray-900"
                : "border-gray-300 bg-white hover:bg-gray-50 text-gray-700 focus:ring-gray-400 focus:ring-offset-white"
            }`}
          >
            Latest Posts
          </a>
        </motion.div>
      </div>
    </div>
  );
}
