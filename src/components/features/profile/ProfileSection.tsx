import { ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface ProfileSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  onSeeAll?: () => void;
  action?: React.ReactNode;
  className?: string;
}

const ProfileSection = ({ title, icon, children, onSeeAll, action, className }: ProfileSectionProps) => {
  return (
    <section className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-brand-primary/10 text-brand-primary">
            {icon}
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white">{title}</h2>
        </div>
        
        {onSeeAll && !action && (
          <button 
            onClick={onSeeAll}
            className="flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-brand-secondary transition-standard group"
          >
            See All
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-standard" />
          </button>
        )}
        {action && (
          <div className="flex items-center">
            {action}
          </div>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {children}
      </motion.div>
    </section>
  );
};

export default ProfileSection;
