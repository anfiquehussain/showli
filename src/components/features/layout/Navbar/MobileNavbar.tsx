import { Link } from 'react-router-dom';
import { User } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Location } from 'react-router-dom';
import { NAV_LINKS } from './types';

interface MobileNavbarProps {
  location: Location;
}

export const MobileNavbar = ({ location }: MobileNavbarProps) => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 pointer-events-none">
      <div className="max-w-md mx-auto bg-card/80 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-1 pointer-events-auto flex items-center justify-between">
        {[...NAV_LINKS, { label: 'Me', path: '/profile', icon: User }].map((link) => {
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.path}
              to={link.path}
              className="relative flex-1 flex flex-col items-center justify-center py-2.5 transition-colors group"
            >
              {isActive && (
                <motion.div
                  layoutId="bottom-nav-active"
                  className="absolute inset-0 bg-brand-primary/10 border border-brand-primary/20 rounded-xl"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
              <link.icon 
                className={`w-5 h-5 mb-1 transition-colors ${isActive ? 'text-brand-primary' : 'text-muted-foreground group-hover:text-white'}`} 
              />
              <span className={`text-[8px] font-black uppercase tracking-tighter transition-colors ${isActive ? 'text-brand-primary' : 'text-muted-foreground group-hover:text-white'}`}>
                {link.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default MobileNavbar;
