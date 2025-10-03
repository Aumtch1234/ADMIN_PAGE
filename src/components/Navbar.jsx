import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { 
  Home, 
  UtensilsCrossed, 
  Users, 
  Bike, 
  CheckCircle, 
  UserPlus, 
  Clock,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Shield,
  User
} from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [role, setRole] = useState(null);
  const [username, setUsername] = useState('');
  const location = useLocation();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setRole(decoded.role);
        setUsername(decoded.username || 'Admin');
      } catch (err) {
        console.error('Invalid token', err);
      }
    }
  }, [token]);

  const menuItems = [
    {
      title: 'Dashboard',
      path: '/dashboard',
      icon: Home,
      show: true
    },
    {
      title: 'Foods',
      path: '/foods',
      icon: UtensilsCrossed,
      show: true
    },
    {
      title: 'Users',
      path: '/users',
      icon: Users,
      show: true
    },
    {
      title: 'Riders',
      path: '/riders',
      icon: Bike,
      show: true
    },
    {
      title: 'Approve',
      path: '/approve',
      icon: CheckCircle,
      show: true
    },
    {
      title: 'Pending Admin',
      path: '/pending-admin',
      icon: Clock,
      show: role === 'm_admin'
    },
    {
      title: 'Add Admin',
      path: '/add-admin',
      icon: UserPlus,
      show: role === 'm_admin'
    }
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  const isActivePath = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      {/* Top Navbar สำหรับ Desktop */}
      <nav className="hidden lg:block bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white shadow-lg">
        <div className="px-6 py-4">
          <div className="flex justify-between items-center">
            {/* Logo/Title */}
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                {role === 'm_admin' ? (
                  <Shield size={24} className="text-white" />
                ) : (
                  <User size={24} className="text-white" />
                )}
              </div>
              <div>
                <h2 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  {role === 'm_admin' ? 'MASTER ADMIN' : 'Admin Panel'}
                </h2>
                <p className="text-xs text-gray-400">Welcome, {username}</p>
              </div>
            </div>

            {/* Menu Items */}
            <div className="flex items-center space-x-2">
              {menuItems.map((item) => {
                if (!item.show) return null;
                const Icon = item.icon;
                const isActive = isActivePath(item.path);

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200
                      ${isActive 
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md' 
                        : 'hover:bg-gray-700 text-gray-300 hover:text-white'}`}
                  >
                    <Icon size={18} />
                    <span className="font-medium">{item.title}</span>
                  </Link>
                );
              })}
              
              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white rounded-lg shadow-md transition-all duration-200 ml-4"
              >
                <LogOut size={18} />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Top Bar */}
      <nav className="lg:hidden bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white shadow-lg">
        <div className="flex justify-between items-center px-4 py-3">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md hover:shadow-lg transition-all duration-200"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
              {role === 'm_admin' ? (
                <Shield size={20} className="text-white" />
              ) : (
                <User size={20} className="text-white" />
              )}
            </div>
            <span className="text-sm font-bold">
              {role === 'm_admin' ? 'MASTER ADMIN' : 'Admin Panel'}
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="p-2 bg-gradient-to-r from-red-600 to-pink-600 rounded-lg"
          >
            <LogOut size={18} />
          </button>
        </div>
      </nav>

      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`lg:hidden fixed left-0 top-0 h-full bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white z-50 transition-transform duration-300 ease-in-out shadow-2xl
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
          w-72`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                  {role === 'm_admin' ? (
                    <Shield size={28} className="text-white" />
                  ) : (
                    <User size={28} className="text-white" />
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    {role === 'm_admin' ? 'MASTER ADMIN' : 'Admin Panel'}
                  </h2>
                  <p className="text-xs text-gray-400 mt-1">Welcome, {username}</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 px-4 py-6 overflow-y-auto">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                if (!item.show) return null;
                const Icon = item.icon;
                const isActive = isActivePath(item.path);

                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 group
                        ${isActive 
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105' 
                          : 'hover:bg-gray-700 hover:transform hover:translate-x-2'}`}
                    >
                      <Icon 
                        size={20} 
                        className={`${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'} transition-colors`}
                      />
                      <span className={`font-medium ${isActive ? 'text-white' : 'text-gray-300'}`}>
                        {item.title}
                      </span>
                      {isActive && (
                        <ChevronRight size={16} className="ml-auto text-white" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-700">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <LogOut size={20} />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}