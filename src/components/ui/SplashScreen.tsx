import { motion } from 'framer-motion';

const SplashScreen = () => {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
    >
      {/* Background glow effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[40%] -left-[30%] w-[80%] h-[80%] rounded-full bg-brand-primary/10 blur-[120px]" />
        <div className="absolute -bottom-[40%] -right-[30%] w-[80%] h-[80%] rounded-full bg-brand-secondary/10 blur-[120px]" />
      </div>

      <div className="relative flex flex-col items-center gap-6 z-10">
        {/* Animated logo wrapper */}
        <motion.div
          className="relative flex items-center justify-center w-24 h-24"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ 
            scale: 1, 
            opacity: 1,
          }}
          transition={{
            duration: 0.8,
            ease: [0.16, 1, 0.3, 1]
          }}
        >
          <motion.img
            src="/icon_without_bg(v).png"
            alt="ShowLi Icon"
            className="w-full h-full object-contain"
            animate={{ 
              scale: [1, 1.05, 1],
            }}
            transition={{
              repeat: Infinity,
              duration: 3,
              ease: "easeInOut"
            }}
          />
        </motion.div>

        {/* Title */}
        <div className="flex flex-col items-center gap-1.5 text-center">
          <motion.h1
            className="text-4xl md:text-5xl font-extrabold font-outfit tracking-wider bg-linear-to-r from-brand-primary via-brand-accent to-brand-secondary bg-clip-text text-transparent"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            ShowLi
          </motion.h1>

          <motion.p
            className="text-sm md:text-base text-text-secondary font-medium tracking-wide"
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.35, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            Your Ultimate Movie Planner
          </motion.p>
        </div>

        {/* Premium subtle loader */}
        <motion.div 
          className="mt-8 flex items-center gap-1.5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse duration-1000" />
          <span className="w-1.5 h-1.5 rounded-full bg-brand-accent animate-pulse duration-1000 [animation-delay:0.2s]" />
          <span className="w-1.5 h-1.5 rounded-full bg-brand-secondary animate-pulse duration-1000 [animation-delay:0.4s]" />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default SplashScreen;
