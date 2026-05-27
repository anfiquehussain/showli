import { Link, useLocation, useNavigate } from 'react-router-dom';
import { User, Film, Calendar, Folder, Loader2, Search, Download } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

import { useAppDispatch } from '@/hooks/useRedux';
import { useAuth } from '@/hooks/useAuth';
import { useInstallPrompt } from '@/hooks/useInstallPrompt';
import { openModal } from '@/store/slices/authSlice';
import Button from '../../ui/Button';
import IconButton from '../../ui/IconButton';

// --- Custom Icons ---

const GithubIcon = ({ className, ...props }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

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
  const { isInstallable, install } = useInstallPrompt();

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
                {/* <div className="transition-standard group-hover:scale-110 filter drop-shadow-[0_4px_12px_rgba(99,102,241,0.25)]">
                  <Logo size={40} className="w-10 h-10" />
                </div> */}
                <span className="text-2xl font-logo text-primary tracking-wider">
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
                {isInstallable && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="relative flex items-center justify-center shrink-0"
                  >
                    <span className="absolute inline-flex h-full w-full rounded-full animate-ping bg-brand-primary/20 opacity-75 pointer-events-none" />
                    <IconButton
                      icon={Download}
                      variant="ghost"
                      aria-label="Install ShowLi App"
                      title="Install ShowLi"
                      onClick={install}
                      className="text-brand-primary hover:text-white hover:bg-brand-primary/10 relative z-10"
                    />
                  </motion.div>
                )}

                <a
                  href="https://github.com/anfiquehussain/showli"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex"
                  title="View GitHub Repository"
                >
                  <IconButton
                    icon={GithubIcon as any}
                    variant="ghost"
                    aria-label="GitHub Repository"
                  />
                </a>

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
              {isInstallable && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="relative flex items-center justify-center shrink-0"
                >
                  <span className="absolute inline-flex h-full w-full rounded-full animate-ping bg-brand-primary/20 opacity-75 pointer-events-none" />
                  <IconButton
                    icon={Download}
                    variant="ghost"
                    aria-label="Install ShowLi App"
                    onClick={install}
                    className="text-brand-primary hover:text-white"
                  />
                </motion.div>
              )}

              <a
                href="https://github.com/anfiquehussain/showli"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex"
                title="View GitHub Repository"
              >
                <IconButton
                  icon={GithubIcon as any}
                  variant="ghost"
                  aria-label="GitHub Repository"
                />
              </a>
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
