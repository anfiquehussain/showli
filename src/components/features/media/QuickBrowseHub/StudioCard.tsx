import { motion } from 'framer-motion';

interface StudioCardProps {
  name: string;
  logoPath: string;
  invertLogo?: boolean;
  onClick: () => void;
}

export const StudioCard = ({ name, logoPath, invertLogo, onClick }: StudioCardProps) => {
  return (
    <motion.button
      whileHover={{ y: -4, scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="relative flex flex-col items-center justify-center p-2 shrink-0 w-32 sm:w-36 text-center cursor-pointer group"
    >
      {logoPath ? (
        <div className="w-24 h-14 flex items-center justify-center mb-2 bg-linear-to-b from-white to-neutral-100 rounded-xl p-2.5 shadow-[0_4px_12px_rgba(0,0,0,0.3)] border border-white/20 group-hover:scale-105 transition-transform duration-300">
          <img 
            src={`https://image.tmdb.org/t/p/w185${logoPath}`}
            alt={name}
            className={`max-w-full max-h-full object-contain opacity-90 group-hover:opacity-100 transition-opacity duration-300 ${
              invertLogo ? 'invert' : ''
            }`}
          />
        </div>
      ) : null}
      <span className="text-[10px] font-medium text-muted-foreground group-hover:text-brand-primary truncate w-full px-1 transition-colors">
        {name}
      </span>
    </motion.button>
  );
};

export default StudioCard;
