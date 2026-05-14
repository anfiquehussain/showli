import { motion } from 'framer-motion';
import { Sparkles, LayoutGrid } from 'lucide-react';

interface HomeToggleProps {
  activeTab: 'featured' | 'discovery';
  onChange: (tab: 'featured' | 'discovery') => void;
}

const HomeToggle = ({ activeTab, onChange }: HomeToggleProps) => {
  return (
    <div className="flex justify-center w-full px-4 mb-8">
      <div className="relative flex p-1 bg-card/40 backdrop-blur-xl border border-white/5 rounded-2xl w-full max-w-sm">
        {/* Sliding background capsule */}
        <motion.div
          className="absolute inset-y-1 bg-brand-primary rounded-xl shadow-lg"
          initial={false}
          animate={{
            x: activeTab === 'featured' ? 0 : '100%',
            width: '50%',
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />

        {/* Featured Tab */}
        <button
          onClick={() => onChange('featured')}
          className={`relative flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold uppercase tracking-wider transition-colors duration-200 z-10 ${
            activeTab === 'featured' ? 'text-white' : 'text-muted-foreground hover:text-white'
          }`}
        >
          <LayoutGrid className="w-4 h-4" />
          <span>Featured</span>
        </button>

        {/* Discovery Tab */}
        <button
          onClick={() => onChange('discovery')}
          className={`relative flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold uppercase tracking-wider transition-colors duration-200 z-10 ${
            activeTab === 'discovery' ? 'text-white' : 'text-muted-foreground hover:text-white'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Discovery</span>
        </button>
      </div>
    </div>
  );
};

export default HomeToggle;
