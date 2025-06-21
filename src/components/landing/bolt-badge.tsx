import { motion } from 'framer-motion'

export function BoltBadge() {
  return (
    <motion.div
      className="fixed top-4 right-4 z-50"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 1, duration: 0.5 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <a
        href="https://bolt.new/"
        target="_blank"
        rel="noopener noreferrer"
        className="block transition-all duration-300 hover:drop-shadow-lg"
        aria-label="Powered by Bolt.new"
      >
        <img
          src="/black_circle_360x360.png"
          alt="Powered by Bolt.new"
          className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full shadow-lg hover:shadow-xl transition-shadow duration-300"
        />
      </a>
    </motion.div>
  )
}