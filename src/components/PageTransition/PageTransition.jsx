import { motion } from "framer-motion";

const variants = {
  slide: {
    initial:    { opacity: 0, x: 20     },
    animate:    { opacity: 1, x: 0      },
    exit:       { opacity: 0, x: -20    },
    transition: { duration: 0.2, ease: "easeInOut" },
  },
  fade: {
    initial:    { opacity: 0            },
    animate:    { opacity: 1            },
    exit:       { opacity: 0            },
    transition: { duration: 0.15, ease: "easeInOut" },
  },
  slideUp: {
    initial:    { opacity: 0, y: 20     },
    animate:    { opacity: 1, y: 0      },
    exit:       { opacity: 0, y: 20     },
    transition: { duration: 0.2, ease: "easeOut" },
  },
  scale: {
    initial:    { opacity: 0, scale: 0.97 },
    animate:    { opacity: 1, scale: 1    },
    exit:       { opacity: 0, scale: 0.97 },
    transition: { duration: 0.15, ease: "easeOut" },
  },
};

const PageTransition = ({ children, type = "slide" }) => {
  const v = variants[type];
  return (
    <motion.div
      initial={v.initial}
      animate={v.animate}
      exit={v.exit}
      transition={v.transition}
      style={{ width: "100%", height: "100%" }}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;