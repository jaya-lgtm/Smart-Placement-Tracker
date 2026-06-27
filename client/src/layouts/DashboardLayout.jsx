import React, { useState, useContext } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  MessageSquare,
  BarChart3,
  User,
  LogOut,
  Bell,
  Menu,
  X,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  Check
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { NotificationContext } from '../context/NotificationContext';

const DashboardLayout = () => {
  const { user, loading, logout } = useContext(AuthContext);
  const { notifications, dismissNotification, clearAllNotifications } = useContext(NotificationContext);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notiDropdownOpen, setNotiDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="h-screen w-screen bg-dark-950 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
        <p className="mt-4 text-slate-400 font-medium animate-pulse">Loading Workspace...</p>
      </div>
    );
  }

  if (!user) {
    // Redirect to login handled by router, but as fallback:
    return null;
  }

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Applications', path: '/applications', icon: Briefcase },
    { name: 'Interviews', path: '/interviews', icon: MessageSquare },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Profile', path: '/profile', icon: User }
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getPageTitle = () => {
    const item = navItems.find(item => item.path === location.pathname);
    if (item) return item.name;
    if (location.pathname.startsWith('/applications/add')) return 'Add Application';
    if (location.pathname.startsWith('/applications/edit')) return 'Edit Application';
    return 'Smart Placement Tracker';
  };

  return (
    <div className="h-screen w-screen flex bg-dark-950 overflow-hidden font-sans text-slate-100">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-dark-900 border-r border-dark-700/60 transition-transform duration-300 lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-dark-700/60">
          <Link to="/" className="flex items-center space-x-2" onClick={() => setSidebarOpen(false)}>
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-brand-600 to-indigo-400 flex items-center justify-center font-bold text-white shadow-glow">
              S
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Smart Placement
            </span>
          </Link>
          <button
            type="button"
            className="rounded-md p-1.5 text-slate-400 hover:bg-dark-700 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Sidebar Nav Links */}
        <nav className="flex-1 space-y-1.5 px-4 py-6 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-glow border border-brand-500/30'
                    : 'text-slate-400 hover:bg-dark-800/80 hover:text-slate-100 border border-transparent'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon className={`mr-3.5 h-5 w-5 shrink-0 transition-transform group-hover:scale-105 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-brand-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer User Info */}
        <div className="p-4 border-t border-dark-700/60 bg-dark-950/40">
          <div className="flex items-center space-x-3 px-2 py-1">
            <div className="h-9 w-9 rounded-full bg-dark-700 border border-brand-500/20 flex items-center justify-center text-brand-400 font-bold text-sm">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-200 truncate">{user.name}</p>
              <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="mt-4 w-full flex items-center justify-center px-4 py-2.5 text-sm font-medium text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-600 border border-rose-500/20 hover:border-rose-500 rounded-xl transition-all duration-200"
          >
            <LogOut className="mr-2.5 h-4.5 w-4.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-dark-700/60 bg-dark-900/40 backdrop-blur-md z-30 shrink-0">
          <div className="flex items-center">
            <button
              type="button"
              className="mr-4 rounded-md p-1.5 text-slate-400 hover:bg-dark-700 lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-bold text-slate-100">{getPageTitle()}</h1>
          </div>

          <div className="flex items-center space-x-4">
            {/* Notification Badge Menu */}
            <div className="relative">
              <button
                type="button"
                className="relative rounded-full p-2 text-slate-400 hover:bg-dark-800 hover:text-slate-100 transition-colors"
                onClick={() => setNotiDropdownOpen(!notiDropdownOpen)}
              >
                <Bell className="h-5 w-5" />
                {notifications.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                  </span>
                )}
              </button>

              {/* Notification Dropdown Panel */}
              {notiDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setNotiDropdownOpen(false)} />
                  <div className="absolute right-0 mt-2.5 w-80 md:w-96 origin-top-right rounded-xl border border-dark-700 bg-dark-900 shadow-2xl p-2 z-50 ring-1 ring-black/5 divide-y divide-dark-700 max-h-[480px] overflow-y-auto">
                    <div className="flex items-center justify-between px-4 py-2 text-xs font-semibold text-slate-400">
                      <span>ALERTS ({notifications.length})</span>
                      {notifications.length > 0 && (
                        <button
                          onClick={clearAllNotifications}
                          className="text-brand-400 hover:text-brand-300 font-medium"
                        >
                          Clear all
                        </button>
                      )}
                    </div>
                    <div className="py-1">
                      {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-slate-500 text-xs">
                          <CheckCircle className="h-8 w-8 text-accent-emerald/40 mb-2" />
                          No active alerts. All set!
                        </div>
                      ) : (
                        notifications.map((n) => {
                          let Icon = AlertCircle;
                          let iconClass = 'text-accent-rose bg-accent-rose/10';
                          if (n.type === 'warning') {
                            Icon = AlertTriangle;
                            iconClass = 'text-accent-amber bg-accent-amber/10';
                          } else if (n.type === 'info') {
                            Icon = Bell;
                            iconClass = 'text-brand-400 bg-brand-400/10';
                          }

                          return (
                            <div key={n.id} className="flex p-3 hover:bg-dark-800/50 rounded-lg group transition-colors">
                              <div className={`mt-0.5 mr-3 flex h-8 w-8 items-center justify-center rounded-lg ${iconClass}`}>
                                <Icon className="h-4.5 w-4.5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-slate-200">{n.title}</p>
                                <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{n.message}</p>
                              </div>
                              <button
                                onClick={() => dismissNotification(n.id)}
                                className="ml-2 text-slate-500 hover:text-slate-300 self-center opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Check className="h-4 w-4" />
                              </button>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Profile Avatar indicator */}
            <Link to="/profile" className="flex items-center space-x-2.5 pl-2 border-l border-dark-700/60 hover:opacity-85 transition-opacity">
              <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-400 flex items-center justify-center text-white font-bold text-xs shadow-md">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="hidden md:inline text-xs font-semibold text-slate-300">{user.name}</span>
            </Link>
          </div>
        </header>

        {/* Page Inner Container */}
        <main className="flex-1 overflow-y-auto bg-dark-950 p-6 relative">
          {/* Subtle Ambient Background Gradients */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-brand-600/5 rounded-full filter blur-[100px] pointer-events-none" />
          <div className="absolute bottom-12 left-10 w-80 h-80 bg-accent-emerald/5 rounded-full filter blur-[80px] pointer-events-none" />
          
          <div className="max-w-7xl mx-auto h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
