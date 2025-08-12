'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Settings, User, LogOut } from 'lucide-react';

interface HeaderProps {
  className?: string;
}

export default function Header({ className = '' }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    localStorage.removeItem("gn_token");
    document.cookie = "gn_token=; path=/; max-age=0";
    router.push("/login");
  };

  const navigationItems = [
    { label: 'Dashboard', path: '/' },
    { label: 'Activities', path: '/activities' },
    { label: 'Community', path: '/community' },
    { label: 'Calendar', path: '/callendar' },
    { label: 'Trips', path: '/trips' },
  ];

  const isActivePath = (path: string) => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(path);
  };

  return (
    <header className={`px-6 py-4 border-b border-[#2a2a35] sticky top-0 z-30 bg-[#0b0b12]/90 backdrop-blur ${className}`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <button 
          onClick={() => router.push("/")} 
          className="text-2xl font-semibold text-white hover:opacity-90 transition-opacity"
        >
          GlobeNomad
        </button>
        
        <nav className="flex items-center gap-6">
          {navigationItems.map((item) => (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={`
                transition-colors
                ${isActivePath(item.path) 
                  ? 'text-white border-b-2 border-[#c7a14a] pb-1' 
                  : 'text-[#E6E8EB] hover:text-white'
                }
              `}
            >
              {item.label}
            </button>
          ))}
          
          <div className="flex items-center gap-3 ml-4">
            <button 
              className="p-2 rounded-md hover:bg-[#14141c] transition-colors" 
              aria-label="Settings"
              onClick={() => router.push('/settings')}
            >
              <Settings className="w-5 h-5 text-[#E6E8EB] hover:text-white" />
            </button>
            <button 
              className="p-2 rounded-md hover:bg-[#14141c] transition-colors" 
              aria-label="Account"
              onClick={() => router.push('/profile')}
            >
              <User className="w-5 h-5 text-[#E6E8EB] hover:text-white" />
            </button>
            <button 
              onClick={handleLogout}
              className="p-2 rounded-md hover:bg-[#14141c] text-red-400 hover:text-red-300 transition-colors" 
              aria-label="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
}
