import { Link } from 'react-router-dom';
import { User, Loader2, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Location } from 'react-router-dom';

import type { User as AuthUser } from '@/types/auth.types';
import IconButton from '@/components/ui/IconButton';
import Button from '@/components/ui/Button';
import GithubIcon from './GithubIcon';
import { NAV_LINKS } from './types';

interface DesktopNavbarProps {
  location: Location;
  isInstallable: boolean;
  install: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
  user: AuthUser | null;
  handleUserClick: () => void;
  onSignInClick: () => void;
}

export const DesktopNavbar = ({
  location,
  isInstallable,
  install,
  isLoading,
  isAuthenticated,
  user,
  handleUserClick,
  onSignInClick,
}: DesktopNavbarProps) => {
  return (
    <div className="hidden md:flex items-center gap-8">
      <div className="flex items-center gap-1">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`
              relative px-4 py-2 text-sm font-medium rounded-xl transition-colors duration-300
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
            icon={GithubIcon}
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
            onClick={onSignInClick}
            className="hidden sm:flex"
          >
            Sign In
          </Button>
        )}
      </div>
    </div>
  );
};

export default DesktopNavbar;
