import { motion } from "framer-motion";

export default function AnimatedBackground() {
  return (
    <motion.div
      className="fixed inset-0 -z-10 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2.5, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Main Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/70 via-purple-50/70 to-pink-50/70 dark:from-gray-900/95 dark:via-gray-900/95 dark:to-gray-900/95" />

      {/* Layer 1 - Primary Orb (Pulsing Core) */}
      <motion.div
        className="absolute top-[15%] left-[15%] w-[35vw] h-[35vw] max-w-[500px] max-h-[500px] bg-gradient-to-br from-indigo-500/30 to-purple-600/40 rounded-full blur-[120px]"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ 
          scale: [1, 1.1, 0.95, 1],
          rotate: [0, 5, -5, 0],
          x: [0, 20, -10, 0],
          y: [0, -15, 10, 0]
        }}
        transition={{
          duration: 45,
          repeat: Infinity,
          ease: "easeInOut",
          times: [0, 0.3, 0.7, 1]
        }}
      />

      {/* Layer 2 - Secondary Orb (Complementary Motion) */}
      <motion.div
        className="absolute bottom-[10%] right-[15%] w-[30vw] h-[30vw] max-w-[400px] max-h-[400px] bg-gradient-to-br from-pink-400/25 to-rose-500/30 rounded-full blur-[100px]"
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{
          scale: [1, 1.15, 0.9, 1],
          rotate: [0, 10, -10, 0],
          x: [0, -30, 15, 0],
          y: [0, 20, -10, 0]
        }}
        transition={{
          duration: 60,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5
        }}
      />

      {/* Layer 3 - Accent Glow (Subtle Movement) */}
      <motion.div
        className="absolute top-[40%] left-[60%] w-[25vw] h-[25vw] max-w-[300px] max-h-[300px] bg-gradient-to-br from-yellow-300/20 to-amber-400/25 rounded-full blur-[80px]"
        animate={{
          scale: [1, 1.05, 0.98, 1],
          rotate: [0, 3, -3, 0],
          x: [0, 10, -5, 0],
          y: [0, -8, 4, 0]
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.8
        }}
      />

      {/* Layer 4 - Floating Particle Effect */}
      <motion.div
        className="absolute top-[70%] left-[20%] w-[15vw] h-[15vw] max-w-[200px] max-h-[200px] bg-gradient-to-br from-blue-400/15 to-cyan-400/20 rounded-full blur-[60px]"
        animate={{
          scale: [1, 1.2, 0.8, 1],
          rotate: [0, 15, -15, 0],
          x: [0, 40, -20, 0],
          y: [0, -25, 12, 0]
        }}
        transition={{
          duration: 50,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.3
        }}
      />

      {/* Layer 5 - Ambient Glow */}
      <motion.div
        className="absolute top-[20%] right-[10%] w-[20vw] h-[20vw] max-w-[250px] max-h-[250px] bg-gradient-to-br from-fuchsia-500/15 to-purple-600/20 rounded-full blur-[90px]"
        animate={{
          scale: [1, 1.1, 0.95, 1],
          rotate: [0, 8, -8, 0],
          x: [0, -15, 7, 0],
          y: [0, 15, -7, 0]
        }}
        transition={{
          duration: 40,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.6
        }}
      />

      {/* Subtle Grain Texture */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxkZWZzPjxwYXR0ZXJuIGlkPSJncmFpbiIgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIiBwYXR0ZXJuVHJhbnNmb3JtPSJyb3RhdGUoNDUpIj48cmVjdCB3aWR0aD0iMSIgaGVpZ2h0PSIxIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDMpIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyYWluKSIvPjwvc3ZnPg==')] opacity-30 dark:opacity-20" />
    </motion.div>
  );
}