import { motion } from "framer-motion";

const PageTransition = ({ children }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.15, ease: "easeInOut" }}
    style={{ width: "100%", height: "100%" }}
  >
    {children}
  </motion.div>
);

export default PageTransition;
