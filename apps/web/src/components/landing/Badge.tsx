import { motion, animate } from "framer-motion"
import { transition } from "three/examples/jsm/tsl/display/TransitionNode.js"

interface AnimatedBadgeProps {
    text: String;
}

export default function AnimatedBadge ({text=""}: AnimatedBadgeProps) {
    return (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 backdrop-blur-sm text-sm font-medium text-primary relative overflow-hidden"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              {/* Animated shimmer effect */}
              <motion.div
                className="absolute inset-0 bg-linear-to-r from-transparent via-primary/20 to-transparent"
                animate={{
                  x: ['-100%', '100%'],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 1,
                  ease: "easeInOut"
                }}
              />
              
              {/* Pulsing dot */}
              <motion.span
                className="relative flex h-2 w-2"
                animate={{
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-75 animate-ping" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </motion.span>
              
              <span className="relative z-10">{text}</span>
            </motion.div>
          </motion.div>
    )
}