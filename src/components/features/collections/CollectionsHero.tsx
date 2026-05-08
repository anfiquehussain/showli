import { motion } from 'framer-motion';
import PageHeader from '@/components/patterns/PageHeader';

interface CollectionsHeroProps {
  stats: {
    label: string;
    value: number;
    icon: any;
    color: string;
    bg: string;
  }[];
}

const CollectionsHero = ({ stats }: CollectionsHeroProps) => {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-primary/10 via-background to-background border border-white/5 p-6 md:p-12">
      <div className="relative z-10">
        <PageHeader 
          title="Your Library" 
          description="Manage your cinematic journey through custom collections and status tracking."
        />
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mt-6 md:mt-10">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-3 md:p-4 rounded-2xl border-white/5 flex items-center gap-3 md:gap-4"
            >
              <div className={`p-2.5 md:p-3 rounded-xl ${stat.bg}`}>
                <stat.icon className={`w-4 h-4 md:w-5 md:h-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-[10px] md:text-xs text-text-secondary font-medium uppercase tracking-wider">{stat.label}</p>
                <p className="text-lg md:text-xl font-bold text-primary">{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/10 blur-[100px] -mr-32 -mt-32 rounded-full" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-brand-secondary/5 blur-[80px] -ml-24 -mb-24 rounded-full" />
    </div>
  );
};

export default CollectionsHero;
