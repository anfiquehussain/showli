import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { User, Menu, X, Film, Calendar, Folder, Loader2 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

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
  { label: 'Schedule', path: '/schedule', icon: Calendar },
  { label: 'Collections', path: '/collections', icon: Folder },
];

// --- Component ---

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const location = useLocation();

  const toggleMobileMenu = (): void => setIsMobileMenuOpen(!isMobileMenuOpen);

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
    <nav className="sticky top-0 z-50 w-full border-b border-gray-border bg-background/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Branding */}
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center transition-standard group-hover:scale-110 shadow-lg shadow-brand-primary/10">
                <Film className="w-6 h-6 text-primary-foreground" aria-hidden="true" />
              </div>
              <span className="text-xl font-heading font-bold text-foreground tracking-tight">
                ShowLi
              </span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <div className="flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`
                    px-4 py-2 text-sm font-medium rounded-xl transition-standard
                    ${location.pathname === link.path 
                      ? 'text-brand-primary bg-brand-primary/10' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-white/5'}
                  `}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="h-6 w-px bg-gray-border" />

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

              {!isAuthenticated && !isLoading && (
                <IconButton 
                  icon={User} 
                  variant="secondary" 
                  aria-label="Login"
                  onClick={() => dispatch(openModal('login'))}
                  className="sm:hidden hover:border-brand-primary/50"
                />
              )}
            </div>
          </div>

          {/* Mobile Toggle */}
          <div className="md:hidden flex items-center gap-2">
            <IconButton
              icon={isMobileMenuOpen ? X : Menu}
              onClick={toggleMobileMenu}
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            />
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-border bg-background animate-in slide-in-from-top duration-200">
          <div className="px-4 pt-2 pb-6 space-y-2">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-standard
                  ${location.pathname === link.path 
                    ? 'text-brand-primary bg-brand-primary/10' 
                    : 'text-secondary hover:text-primary hover:bg-gray-light'}
                `}
              >
                <link.icon className="w-5 h-5" aria-hidden="true" />
                {link.label}
              </Link>
            ))}
            <div className="pt-4 border-t border-gray-border">
              <Link
                to="/profile"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-secondary hover:text-primary hover:bg-gray-light transition-standard"
              >
                <User className="w-5 h-5" aria-hidden="true" />
                <span>Profile Settings</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
