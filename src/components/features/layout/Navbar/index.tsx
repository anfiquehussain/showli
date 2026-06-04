import { Link, useLocation, useNavigate } from 'react-router-dom';
import { User, Loader2, Download } from 'lucide-react';
import { motion } from 'framer-motion';

import { useAppDispatch } from '@/hooks/useRedux';
import { useAuth } from '@/hooks/useAuth';
import { useInstallPrompt } from '@/hooks/useInstallPrompt';
import { openModal } from '@/store/slices/authSlice';
import Button from '@/components/ui/Button';
import IconButton from '@/components/ui/IconButton';
import DesktopNavbar from './DesktopNavbar';
import MobileNavbar from './MobileNavbar';
import GithubIcon from './GithubIcon';

export const Navbar = () => {
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

  const handleSignInClick = () => {
    dispatch(openModal('login'));
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
                <span className="text-2xl font-logo text-primary tracking-wider">
                  ShowLi
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <DesktopNavbar
              location={location}
              isInstallable={isInstallable}
              install={install}
              isLoading={isLoading}
              isAuthenticated={isAuthenticated}
              user={user}
              handleUserClick={handleUserClick}
              onSignInClick={handleSignInClick}
            />

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
                  icon={GithubIcon}
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
                  onClick={handleSignInClick}
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
      <MobileNavbar location={location} />
    </>
  );
};

export default Navbar;
