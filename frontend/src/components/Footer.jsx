import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from "react-icons/fa";

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-900 to-black text-gray-300 mt-12 safe-bottom">
      <motion.div
        className="container-tight py-12 sm:py-14 md:py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 lg:gap-12"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        variants={containerVariants}
      >
        <motion.div variants={itemVariants} className="space-y-3">
          <h2 className="text-lg sm:text-xl font-extrabold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            BlogSy Platform
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
            Your ultimate space to share ideas, knowledge, and stories with the world.
          </p>
          <p className="text-xs text-gray-500 pt-2">
            Built with ❤️ by{" "}
            <a
              href="https://www.linkedin.com/in/satyam-sawant-a257802a7/"
              className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              Satyam Sawant
            </a>
          </p>
        </motion.div>

        <motion.div variants={itemVariants}>
          <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-white border-b border-gray-600 inline-block pb-1">
            Quick Links
          </h3>
          <ul className="space-y-2.5 text-sm">
            {[
              { to: "/", label: "Home" },
              { to: "/latest", label: "Latest Blogs" },
              { to: "/trending", label: "Trending" },
            ].map(({ to, label }) => (
              <li key={to}>
                <Link
                  to={to}
                  className="text-gray-400 hover:text-indigo-400 transition-colors duration-200 inline-block py-0.5"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div variants={itemVariants}>
          <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-white border-b border-gray-600 inline-block pb-1">
            Contact
          </h3>
          <ul className="space-y-2.5 text-sm text-gray-400">
            <li>
              <a
                href="mailto:satyamsawant54@gmail.com"
                className="hover:text-indigo-400 transition-colors break-all"
              >
                satyamsawant54@gmail.com
              </a>
            </li>
            <li>
              <a href="tel:+919326903988" className="hover:text-indigo-400 transition-colors">
                +91 9326903988
              </a>
            </li>
          </ul>
        </motion.div>

        <motion.div variants={itemVariants}>
          <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-white border-b border-gray-600 inline-block pb-1">
            Stay Connected
          </h3>
          <p className="text-sm text-gray-400 mb-3">Follow us for updates</p>
          <div className="flex gap-3 sm:gap-4">
            {[
              { href: "#", Icon: FaFacebookF, color: "hover:text-blue-400" },
              { href: "#", Icon: FaTwitter, color: "hover:text-sky-400" },
              { href: "#", Icon: FaInstagram, color: "hover:text-pink-400" },
              { href: "https://www.linkedin.com/in/satyam-sawant-a257802a7/", Icon: FaLinkedinIn, color: "hover:text-blue-400", external: true },
            ].map(({ href, Icon, color, external }) => (
              <motion.a
                key={href}
                href={href}
                target={external ? "_blank" : undefined}
                rel={external ? "noopener noreferrer" : undefined}
                className={`text-gray-400 ${color} transition-colors text-lg sm:text-xl p-2 rounded-lg hover:bg-gray-800/50`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Icon />
              </motion.a>
            ))}
          </div>
        </motion.div>
      </motion.div>

      <motion.div
        className="border-t border-gray-700/80 py-4 sm:py-5 text-center safe-x"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
      >
        <span className="text-xs sm:text-sm bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent font-semibold tracking-wide">
          © {new Date().getFullYear()} BlogSy | Powered by Satyam Software Solutions
        </span>
      </motion.div>
    </footer>
  );
}
