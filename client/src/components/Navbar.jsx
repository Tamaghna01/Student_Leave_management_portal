import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const BellIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

const Navbar = ({ onMenuToggle, pageTitle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const roleBadgeColor = user?.role === 'faculty'
    ? 'bg-violet-100 text-violet-700'
    : 'bg-primary-100 text-primary-700';

  return (
    <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-slate-100 px-4 lg:px-6 h-16 flex items-center justify-between gap-4">
      {/* Left: Menu + Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          id="menu-toggle-btn"
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
          aria-label="Toggle sidebar"
        >
          <MenuIcon />
        </button>
        <div className="min-w-0">
          <h1 className="text-base font-semibold text-slate-800 truncate">{pageTitle || 'Dashboard'}</h1>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Notification Bell */}
        <button
          className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
          aria-label="Notifications"
        >
          <BellIcon />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary-500 rounded-full" />
        </button>

        {/* Role Badge */}
        <span className={`hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${roleBadgeColor}`}>
          {user?.role}
        </span>

        {/* Avatar Dropdown */}
        <div className="flex items-center gap-2 ml-1">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-semibold text-white">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
          <div className="hidden md:block">
            <p className="text-xs font-medium text-slate-700 leading-none">{user?.name}</p>
            <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[140px]">{user?.email}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
