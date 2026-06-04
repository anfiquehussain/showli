import type { LucideIcon } from 'lucide-react';
import { Film, Calendar, Folder, Search } from 'lucide-react';

export interface NavLink {
  label: string;
  path: string;
  icon: LucideIcon;
}

export const NAV_LINKS: NavLink[] = [
  { label: 'Discover', path: '/', icon: Film },
  { label: 'Browse', path: '/browse', icon: Search },
  { label: 'Schedule', path: '/schedule', icon: Calendar },
  { label: 'Collections', path: '/collections', icon: Folder },
];
