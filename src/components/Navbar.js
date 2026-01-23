import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [installmentsDropdownOpen, setInstallmentsDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.info("Logged out successfully");
    navigate("/login");
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const navLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
  ];

  const installmentLinks = [
    { path: '/installments/list', label: 'My Installments', icon: '📋' },
    { path: '/installments/create', label: 'Create Installment', icon: '➕' },
  ];

  const isInstallmentActive = () => {
    return location.pathname.startsWith('/installments');
  };

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (installmentsDropdownOpen) {
        const dropdown = document.querySelector('.installments-dropdown');
        if (dropdown && !dropdown.contains(event.target)) {
          setInstallmentsDropdownOpen(false);
        }
      }
    };
    if (installmentsDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [installmentsDropdownOpen]);

  return (
    <nav className="bg-white shadow-lg border-b-2 border-primary/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold text-primary">MADADGAAR</h1>
              <span className="ml-2 text-sm text-gray-600 hidden sm:inline">Agent Panel</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center gap-2 ${
                  isActive(link.path)
                    ? 'bg-primary text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-primary'
                }`}
              >
                <span>{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            ))}
            
            {/* Installments Dropdown */}
            <div className="relative installments-dropdown">
              <button
                onClick={() => setInstallmentsDropdownOpen(!installmentsDropdownOpen)}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center gap-2 ${
                  isInstallmentActive()
                    ? 'bg-primary text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-primary'
                }`}
              >
                <span>💳</span>
                <span>Installments</span>
                <svg
                  className={`w-4 h-4 transition-transform ${installmentsDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {installmentsDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  {installmentLinks.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setInstallmentsDropdownOpen(false)}
                      className={`block px-4 py-2 text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                        isActive(link.path)
                          ? 'bg-primary/10 text-primary border-l-4 border-primary'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-primary'
                      }`}
                    >
                      <span>{link.icon}</span>
                      <span>{link.label}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* User Info and Actions */}
          <div className="flex items-center space-x-4">
            {/* User Info - Desktop */}
            <div className="hidden sm:block text-right">
              <p className="text-sm font-semibold text-gray-800">{user?.name || 'Agent'}</p>
              <p className="text-xs text-gray-500">{user?.email || ''}</p>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-all duration-200 font-semibold text-sm shadow-md hover:shadow-lg active:scale-95"
            >
              Logout
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100"
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {mobileMenuOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4 space-y-2">
            {/* User Info - Mobile */}
            <div className="px-4 py-2 border-b border-gray-200">
              <p className="text-sm font-semibold text-gray-800">{user?.name || 'Agent'}</p>
              <p className="text-xs text-gray-500">{user?.email || ''}</p>
            </div>

            {/* Mobile Navigation Links */}
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-3 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center gap-2 ${
                  isActive(link.path)
                    ? 'bg-primary text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span>{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            ))}
            
            {/* Mobile Installments Section */}
            <div className="px-4 py-2">
              <button
                onClick={() => setInstallmentsDropdownOpen(!installmentsDropdownOpen)}
                className={`w-full px-4 py-3 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center justify-between ${
                  isInstallmentActive()
                    ? 'bg-primary text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>💳</span>
                  <span>Installments</span>
                </div>
                <svg
                  className={`w-4 h-4 transition-transform ${installmentsDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {installmentsDropdownOpen && (
                <div className="mt-2 space-y-1 pl-6">
                  {installmentLinks.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setInstallmentsDropdownOpen(false);
                      }}
                      className={`block px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center gap-2 ${
                        isActive(link.path)
                          ? 'bg-primary/20 text-primary'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <span>{link.icon}</span>
                      <span>{link.label}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
