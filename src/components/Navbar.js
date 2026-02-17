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
  const [propertiesDropdownOpen, setPropertiesDropdownOpen] = useState(false);
  const [insuranceDropdownOpen, setInsuranceDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.info("Logged out successfully");
    navigate("/login");
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const navLinks = [
    { path: '/dashboard', label: 'Assignments', icon: '📋' },
    { path: '/profile/view', label: 'Profile', icon: '👤' },
  ];

  const installmentLinks = [
    { path: '/installments/list', label: 'My Installments', icon: '📋' },
    { path: '/installments/create', label: 'Create Installment', icon: '➕' },
    { path: '/installments/applications', label: 'Applications', icon: '📝' },
  ];

  const propertyLinks = [
    { path: '/property/list', label: 'My Properties', icon: '🏠' },
    { path: '/property/add', label: 'Add Property', icon: '➕' },
    { path: '/property/applications', label: 'Applications', icon: '📝' },
  ];

  const insuranceLinks = [
    { path: '/insurance/list', label: 'My Insurance Plans', icon: '🛡️' },
    { path: '/insurance/create', label: 'Create Plan', icon: '➕' },
    { path: '/insurance/applications', label: 'Applications', icon: '📝' },
  ];

  const isInstallmentActive = () => {
    return location.pathname.startsWith('/installments');
  };

  const isPropertyActive = () => {
    return location.pathname.startsWith('/property');
  };

  const isInsuranceActive = () => {
    return location.pathname.startsWith('/insurance');
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
      if (propertiesDropdownOpen) {
        const dropdown = document.querySelector('.properties-dropdown');
        if (dropdown && !dropdown.contains(event.target)) {
          setPropertiesDropdownOpen(false);
        }
      }
      if (insuranceDropdownOpen) {
        const dropdown = document.querySelector('.insurance-dropdown');
        if (dropdown && !dropdown.contains(event.target)) {
          setInsuranceDropdownOpen(false);
        }
      }
    };
    if (installmentsDropdownOpen || propertiesDropdownOpen || insuranceDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [installmentsDropdownOpen, propertiesDropdownOpen, insuranceDropdownOpen]);

  return (
    <nav className="bg-white shadow-lg border-b-2 border-red-200/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
            <Link to="/dashboard" className="flex items-center space-x-1 sm:space-x-2 min-w-0">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-red-600 truncate">MADADGAAR</h1>
              <span className="ml-1 sm:ml-2 text-xs sm:text-sm text-gray-600 hidden sm:inline whitespace-nowrap">Agent Panel</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center flex-wrap gap-1 justify-end max-w-full">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center gap-2 ${
                  isActive(link.path)
                    ? 'bg-red-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-red-600'
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
                    ? 'bg-red-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-red-600'
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
                      className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                        isActive(link.path)
                          ? 'bg-red-50 text-red-600 border-l-4 border-red-600'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-red-600'
                      }`}
                    >
                      <span>{link.icon}</span>
                      <span>{link.label}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Properties Dropdown */}
            <div className="relative properties-dropdown">
              <button
                onClick={() => setPropertiesDropdownOpen(!propertiesDropdownOpen)}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center gap-2 ${
                  isPropertyActive()
                    ? 'bg-red-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-red-600'
                }`}
              >
                <span>🏠</span>
                <span>Properties</span>
                <svg
                  className={`w-4 h-4 transition-transform ${propertiesDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {propertiesDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  {propertyLinks.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setPropertiesDropdownOpen(false)}
                      className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                        isActive(link.path)
                          ? 'bg-red-50 text-red-600 border-l-4 border-red-600'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-red-600'
                      }`}
                    >
                      <span>{link.icon}</span>
                      <span>{link.label}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Insurance Dropdown */}
            <div className="relative insurance-dropdown">
              <button
                onClick={() => setInsuranceDropdownOpen(!insuranceDropdownOpen)}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center gap-2 ${
                  isInsuranceActive()
                    ? 'bg-red-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-red-600'
                }`}
              >
                <span>🛡️</span>
                <span>Insurance</span>
                <svg
                  className={`w-4 h-4 transition-transform ${insuranceDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {insuranceDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  {insuranceLinks.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setInsuranceDropdownOpen(false)}
                      className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                        isActive(link.path)
                          ? 'bg-red-50 text-red-600 border-l-4 border-red-600'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-red-600'
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
          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            {/* User Info - Desktop */}
            <div className="hidden lg:block text-right min-w-0 max-w-[140px]">
              <p className="text-sm font-semibold text-gray-800 truncate">{user?.name || 'Agent'}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email || ''}</p>
            </div>

            {/* Logout Button - hidden on mobile (logout is in mobile menu) */}
            <button
              onClick={handleLogout}
              className="hidden md:inline-flex bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg transition-all duration-200 font-semibold text-sm shadow-md hover:shadow-lg active:scale-95 whitespace-nowrap"
            >
              Logout
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500"
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
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
          <div className="md:hidden border-t border-gray-200 py-4 space-y-2 max-h-[calc(100vh-4rem)] overflow-y-auto">
            {/* User Info - Mobile */}
            <div className="px-4 py-2 border-b border-gray-200">
              <p className="text-sm font-semibold text-gray-800 truncate">{user?.name || 'Agent'}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email || ''}</p>
            </div>

            {/* Mobile Navigation Links */}
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg font-semibold text-sm transition-all duration-200 ${
                  isActive(link.path)
                    ? 'bg-red-600 text-white'
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
                    ? 'bg-red-600 text-white'
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
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 ${
                        isActive(link.path)
                          ? 'bg-red-50 text-red-600'
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

            {/* Mobile Properties Section */}
            <div className="px-4 py-2">
              <button
                onClick={() => setPropertiesDropdownOpen(!propertiesDropdownOpen)}
                className={`w-full px-4 py-3 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center justify-between ${
                  isPropertyActive()
                    ? 'bg-red-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>🏠</span>
                  <span>Properties</span>
                </div>
                <svg
                  className={`w-4 h-4 transition-transform ${propertiesDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {propertiesDropdownOpen && (
                <div className="mt-2 space-y-1 pl-6">
                  {propertyLinks.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setPropertiesDropdownOpen(false);
                      }}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 ${
                        isActive(link.path)
                          ? 'bg-red-50 text-red-600'
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

            {/* Mobile Insurance Section */}
            <div className="px-4 py-2">
              <button
                onClick={() => setInsuranceDropdownOpen(!insuranceDropdownOpen)}
                className={`w-full px-4 py-3 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center justify-between ${
                  isInsuranceActive()
                    ? 'bg-red-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>🛡️</span>
                  <span>Insurance</span>
                </div>
                <svg
                  className={`w-4 h-4 transition-transform ${insuranceDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {insuranceDropdownOpen && (
                <div className="mt-2 space-y-1 pl-6">
                  {insuranceLinks.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setInsuranceDropdownOpen(false);
                      }}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 ${
                        isActive(link.path)
                          ? 'bg-red-50 text-red-600'
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

            {/* Mobile Logout */}
            <div className="px-4 pt-2 border-t border-gray-200">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full px-4 py-3 rounded-lg font-semibold text-sm bg-red-600 hover:bg-red-700 text-white text-center transition-all duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
