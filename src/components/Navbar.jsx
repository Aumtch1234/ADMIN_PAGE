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
  ChevronDown,
  Shield,
  User
} from 'lucide-react';
import { BiMoneyWithdraw } from 'react-icons/bi';
import { MdManageHistory } from 'react-icons/md';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isApproveOpen, setIsApproveOpen] = useState(false);
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
      title: 'แดชบอร์ด',
      path: '/dashboard',
      icon: Home,
      show: true
    },
    {
      title: 'ร้านค้าแอดมิน (ทั้งหมด)',
      path: '/markets',
      icon: UtensilsCrossed,
      show: true
    },
    {
      title: 'จัดการคำร้องขอ',
      path: '/complaints',
      icon: MdManageHistory,
      show: true
    },
    {
      title: 'ผู้ใช้ทั้งหมด',
      path: '/users',
      icon: Users,
      show: true
    },
    {
      title: 'จัดการสิทธิ์',
      path: '/pending-admin',
      icon: Clock,
      show: role === 'm_admin'
    },
    {
      title: 'เพิ่มผู้ดูแลระบบ',
      path: '/add-admin',
      icon: UserPlus,
      show: role === 'm_admin'
    }
  ];

  const approveItems = [
    {
      title: 'อนุมัติไรเดอร์',
      path: '/riders',
      icon: Bike,
      show: true
    },
    {
      title: 'อนุมัติร้านค้า',
      path: '/approve',
      icon: CheckCircle,
      show: true
    },
    {
      title: 'อนุมัติยอดเติมเงินไรเดอร์',
      path: '/topup-approve',
      icon: BiMoneyWithdraw,
      show: true
    }
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  const isActivePath = (path) => {
    return location.pathname === path;
  };

  const isApproveSection = () => {
    return approveItems.some(item => item.path === location.pathname);
  };

  return (
    <>
      {/* Top Bar */}
      <nav className="fixed top-0 left-0 right-0 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white shadow-lg z-30">
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
            <div className="hidden sm:block">
              <h2 className="text-sm font-bold">
                {role === 'm_admin' ? 'MASTER ADMIN' : 'Admin Panel'}
              </h2>
              <p className="text-xs text-gray-400">Welcome, {username}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="p-2 bg-gradient-to-r from-red-600 to-pink-600 rounded-lg hover:from-red-700 hover:to-pink-700 transition-all duration-200"
          >
            <LogOut size={18} />
          </button>
        </div>
      </nav>

      {/* Sidebar Overlay with Blur */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-all duration-300"
          style={{ marginTop: '56px' }}
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white z-50 transition-transform duration-300 ease-in-out shadow-2xl
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
          w-72`}
        style={{ 
          top: '56px',
          height: 'calc(100vh - 56px)'
        }}
      >
        <div className="flex flex-col h-full">
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

              {/* Approve Dropdown */}
              <li>
                <button
                  onClick={() => setIsApproveOpen(!isApproveOpen)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 group
                    ${isApproveSection() 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
                      : 'hover:bg-gray-700'}`}
                >
                  <CheckCircle 
                    size={20} 
                    className={`${isApproveSection() ? 'text-white' : 'text-gray-400 group-hover:text-white'} transition-colors`}
                  />
                  <span className={`font-medium flex-1 text-left ${isApproveSection() ? 'text-white' : 'text-gray-300'}`}>
                    การอนุมัติทั้งหมด
                  </span>
                  <ChevronDown 
                    size={16} 
                    className={`transition-transform duration-300 ${isApproveOpen ? 'rotate-180' : ''} ${isApproveSection() ? 'text-white' : 'text-gray-400'}`}
                  />
                </button>

                {/* Dropdown Menu */}
                <div
                  className={`mt-2 ml-4 space-y-1 overflow-hidden transition-all duration-300 ${
                    isApproveOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  {approveItems.map((item) => {
                    if (!item.show) return null;
                    const Icon = item.icon;
                    const isActive = isActivePath(item.path);

                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-all duration-200 group
                          ${isActive 
                            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md' 
                            : 'hover:bg-gray-700 hover:translate-x-1'}`}
                      >
                        <Icon 
                          size={18} 
                          className={`${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'} transition-colors`}
                        />
                        <span className={`text-sm font-medium ${isActive ? 'text-white' : 'text-gray-300'}`}>
                          {item.title}
                        </span>
                        {isActive && (
                          <ChevronRight size={14} className="ml-auto text-white" />
                        )}
                      </Link>
                    );
                  })}
                </div>
              </li>
            </ul>
          </nav>

          {/* Footer - Fixed at bottom */}
          <div className="p-4 border-t border-gray-700 mt-auto">
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

      {/* Spacer for top bar */}
      <div style={{ height: '56px' }} />
    </>
  );
}