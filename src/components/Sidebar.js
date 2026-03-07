import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

const Sidebar = ({ onCloseMobile }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [installmentsOpen, setInstallmentsOpen] = useState(false);
  const [propertiesOpen, setPropertiesOpen] = useState(false);
  const [insuranceOpen, setInsuranceOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.info("Logged out successfully");
    navigate("/login");
    onCloseMobile?.();
  };

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  const mainLinks = [
    { path: "/dashboard", label: "Dashboard", icon: "📋" },
    { path: "/cases", label: "Cases", icon: "📁" },
    { path: "/wallet", label: "Wallet", icon: "💰" },
   
    { path: "/linked-partners", label: "Partners", icon: "🤝" },
    { path: "/profile/view", label: "Profile", icon: "👤" },
  ];

  const installmentLinks = [
    { path: "/installments/list", label: "My Installments", icon: "📋" },
    { path: "/installments/create", label: "Create Installment", icon: "➕" },
    { path: "/installments/applications", label: "Applications", icon: "📝" },
  ];

  const propertyLinks = [
    { path: "/property/list", label: "My Properties", icon: "🏠" },
    { path: "/property/add", label: "Add Property", icon: "➕" },
    { path: "/property/applications", label: "Applications", icon: "📝" },
  ];

  const insuranceLinks = [
    { path: "/insurance/list", label: "My Insurance Plans", icon: "🛡️" },
    { path: "/insurance/create", label: "Create Plan", icon: "➕" },
    { path: "/insurance/applications", label: "Applications", icon: "📝" },
  ];

  const linkClass = (active) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
      active
        ? "bg-red-600 text-white"
        : "text-gray-700 hover:bg-gray-100 hover:text-red-600"
    }`;

  const subLinkClass = (active) =>
    `flex items-center gap-3 pl-9 pr-3 py-2 rounded-lg text-sm transition-colors ${
      active
        ? "bg-red-50 text-red-600 font-medium border-l-2 border-red-600"
        : "text-gray-600 hover:bg-gray-50 hover:text-red-600"
    }`;

  const NavLink = ({ to, icon, label, onClick }) => (
    <Link
      to={to}
      onClick={onClick}
      className={linkClass(isActive(to))}
    >
      <span className="text-lg">{icon}</span>
      <span>{label}</span>
    </Link>
  );

  const Section = ({ title, icon, open, onToggle, children }) => (
    <div className="py-1">
      <button
        type="button"
        onClick={onToggle}
        className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
          open ? "bg-gray-100 text-red-600" : "text-gray-700 hover:bg-gray-50"
        }`}
      >
        <span className="flex items-center gap-3">
          <span className="text-lg">{icon}</span>
          <span>{title}</span>
        </span>
        <svg
          className={`w-4 h-4 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && <div className="mt-1 space-y-0.5">{children}</div>}
    </div>
  );

  return (
    <aside className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* Brand */}
      <div className="p-4 border-b border-gray-100 shrink-0">
        <Link
          to="/dashboard"
          onClick={onCloseMobile}
          className="flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded-lg"
        >
          <span className="text-xl font-bold text-red-600 tracking-tight">MADADGAAR</span>
          <span className="text-xs font-medium text-gray-500 hidden sm:inline">Agent</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {mainLinks.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            icon={link.icon}
            label={link.label}
            onClick={onCloseMobile}
          />
        ))}

        <Section
          title="Installments"
          icon="💳"
          open={installmentsOpen}
          onToggle={() => setInstallmentsOpen(!installmentsOpen)}
        >
          {installmentLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={onCloseMobile}
              className={subLinkClass(isActive(link.path))}
            >
              <span>{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          ))}
        </Section>

        <Section
          title="Properties"
          icon="🏠"
          open={propertiesOpen}
          onToggle={() => setPropertiesOpen(!propertiesOpen)}
        >
          {propertyLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={onCloseMobile}
              className={subLinkClass(isActive(link.path))}
            >
              <span>{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          ))}
        </Section>

        <Section
          title="Insurance"
          icon="🛡️"
          open={insuranceOpen}
          onToggle={() => setInsuranceOpen(!insuranceOpen)}
        >
          {insuranceLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={onCloseMobile}
              className={subLinkClass(isActive(link.path))}
            >
              <span>{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          ))}
        </Section>
      </nav>

      {/* User & Logout */}
      <div className="p-3 border-t border-gray-100 space-y-2 shrink-0">
        <div className="px-3 py-2 rounded-lg bg-gray-50">
          <p className="text-sm font-semibold text-gray-800 truncate">{user?.name || "Agent"}</p>
          <p className="text-xs text-gray-500 truncate">{user?.email || ""}</p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold bg-red-600 hover:bg-red-700 text-white transition"
        >
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
