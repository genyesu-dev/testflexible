
'use client';
import { usePathname, useRouter } from 'next/navigation';
import { Home, TrendingDown, TrendingUp, Star, Settings } from 'lucide-react';

const tabs = [
  { label: '홈', icon: Home, path: '/dashboard', color: 'text-blue-500', bg: 'bg-blue-50' },
  { label: '매도', icon: TrendingDown, path: '/dashboard/sell', color: 'text-red-500', bg: 'bg-red-50' },
  { label: '물타기', icon: TrendingUp, path: '/dashboard/averaging', color: 'text-green-500', bg: 'bg-green-50' },
  { label: '관심종목', icon: Star, path: '/dashboard/watchlist', color: 'text-purple-500', bg: 'bg-purple-50' },
  { label: '설정', icon: Settings, path: '/dashboard/settings', color: 'text-gray-500', bg: 'bg-gray-50' },
];

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-bottom">
      <div className="max-w-lg mx-auto flex justify-around items-center h-16 px-2">
        {tabs.map((tab) => {
          const isActive = pathname === tab.path || (tab.path !== '/dashboard' && pathname.startsWith(tab.path));
          const Icon = tab.icon;
          return (
            <button
              key={tab.path}
              onClick={() => router.push(tab.path)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all ${isActive ? tab.bg : ''}`}
            >
              {isActive && <div className={`w-6 h-0.5 rounded-full ${tab.color.replace('text-', 'bg-')} mb-0.5`} />}
              <Icon className={`w-5 h-5 ${isActive ? tab.color : 'text-gray-400'}`} />
              <span className={`text-[10px] font-medium ${isActive ? tab.color : 'text-gray-400'}`}>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
