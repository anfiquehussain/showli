import { Link, useLocation, useNavigate } from 'react-router-dom';
import { User, Film, Calendar, Folder, Loader2, Search } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

import { useAppDispatch } from '@/hooks/useRedux';
import { useAuth } from '@/hooks/useAuth';
import { openModal } from '@/store/slices/authSlice';
import Button from '../../ui/Button';
import IconButton from '../../ui/IconButton';

// --- Types ---

interface NavLink {
  label: string;
  path: string;
  icon: LucideIcon;
}

// --- Constants ---

const NAV_LINKS: NavLink[] = [
  { label: 'Discover', path: '/', icon: Film },
  { label: 'Browse', path: '/browse', icon: Search },
  { label: 'Schedule', path: '/schedule', icon: Calendar },
  { label: 'Collections', path: '/collections', icon: Folder },
];

// --- Components ---

const Navbar = () => {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleUserClick = () => {
    if (isAuthenticated) {
      navigate('/profile');
    } else {
      dispatch(openModal('login'));
    }
  };

  return (
    <>
      {/* Main Top Header */}
      <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Branding */}
            <div className="flex items-center gap-2">
              <Link to="/" className="flex items-center gap-3 group">
                <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center transition-standard group-hover:scale-110 shadow-lg shadow-brand-primary/10">
                  <Film className="w-6 h-6 text-white" aria-hidden="true" />
                </div>
                <span className="text-xl font-heading font-bold text-white tracking-tight">
                  ShowLi
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <div className="flex items-center gap-1">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`
                      relative px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300
                      ${location.pathname === link.path 
                        ? 'text-white' 
                        : 'text-muted-foreground hover:text-white hover:bg-white/5'}
                    `}
                  >
                    {location.pathname === link.path && (
                      <motion.div
                        layoutId="nav-active"
                        className="absolute inset-0 bg-brand-primary/10 border border-brand-primary/20 rounded-xl"
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <span className="relative z-10">{link.label}</span>
                  </Link>
                ))}
              </div>

              <div className="h-6 w-px bg-white/10" />

              <div className="flex items-center gap-4">
                {isLoading ? (
                  <Loader2 className="w-5 h-5 text-brand-primary animate-spin" />
                ) : isAuthenticated ? (
                  <div className="flex items-center gap-3">
                    <span className="hidden lg:block text-sm font-medium text-muted-foreground">
                      {user?.displayName || 'User'}
                    </span>
                    <IconButton 
                      icon={User} 
                      variant="primary" 
                      aria-label="Profile"
                      onClick={handleUserClick}
                      className="shadow-lg shadow-brand-primary/20"
                    />
                  </div>
                ) : (
                  <Button 
                    size="sm" 
                    onClick={() => dispatch(openModal('login'))}
                    className="hidden sm:flex"
                  >
                    Sign In
                  </Button>
                )}
              </div>
            </div>

            {/* Mobile Minimal Actions (Top Right) */}
            <div className="md:hidden flex items-center gap-2">
              {isLoading ? (
                <Loader2 className="w-5 h-5 text-brand-primary animate-spin" />
              ) : isAuthenticated ? (
                <button 
                  onClick={handleUserClick}
                  className="w-9 h-9 rounded-full bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center overflow-hidden transition-standard active:scale-90"
                >
                  <User className="w-5 h-5 text-brand-primary" />
                </button>
              ) : (
                <Button 
                  size="sm" 
                  onClick={() => dispatch(openModal('login'))}
                  className="h-9 px-4 rounded-lg text-[11px]"
                >
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation - Primary Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 pointer-events-none">
        <div className="max-w-md mx-auto bg-card/80 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-1 pointer-events-auto flex items-center justify-between">
          {[...NAV_LINKS, { label: 'Me', path: '/profile', icon: User }].map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className="relative flex-1 flex flex-col items-center justify-center py-2.5 transition-all group"
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
    </>
  );
};

export default Navbar;
