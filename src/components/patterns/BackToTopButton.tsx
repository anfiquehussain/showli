import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';

/**
 * BackToTopButton provides a premium floating action button that appears
 * after the user has scrolled down the page. It allows for a smooth
 * jump back to the top of the content, which is essential for infinite-scroll pages.
 */
const BackToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      // Show button after 600px of scrolling
      if (window.scrollY > 600) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility, { passive: true });
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={scrollToTop}
          className="fixed bottom-24 md:bottom-10 right-6 z-60 p-4 rounded-full bg-brand-primary text-white shadow-[0_0_20px_rgba(99,102,241,0.4)] border border-white/20 hover:bg-brand-light transition-colors group backdrop-blur-md"
          aria-label="Back to top"
        >
          <ArrowUp className="w-6 h-6 group-hover:-translate-y-1 transition-transform" />
          
          {/* Subtle pulse effect */}
          <span className="absolute inset-0 rounded-full bg-brand-primary animate-ping opacity-20 pointer-events-none" />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default BackToTopButton;
