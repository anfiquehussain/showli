import { motion } from 'framer-motion';
import { Play } from 'lucide-react';

interface ProviderCardProps {
  name: string;
  logoPath?: string;
  onClick: () => void;
}

export const ProviderCard = ({ name, logoPath, onClick }: ProviderCardProps) => {
  return (
    <motion.button
      whileHover={{ y: -4, scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="relative flex flex-col items-center justify-center p-2 shrink-0 w-20 sm:w-24 text-center cursor-pointer group"
    >
      {logoPath ? (
        <div className="w-12 h-12 rounded-xl overflow-hidden mb-2 border border-white/5 group-hover:border-brand-primary/50 transition-colors shadow-[0_4px_12px_rgba(0,0,0,0.3)]">
          <img 
            src={`https://image.tmdb.org/t/p/w92${logoPath}`}
            alt={name}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="w-12 h-12 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center mb-2 border border-brand-primary/20">
          <Play className="w-6 h-6" />
        </div>
      )}
      <span className="text-[10px] font-medium text-muted-foreground group-hover:text-brand-primary truncate w-full px-1 transition-colors">
        {name}
      </span>
    </motion.button>
  );
};

export default ProviderCard;
