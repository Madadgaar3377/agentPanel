import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Sidebar from "./Sidebar";

const SIDEBAR_WIDTH = 260;

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setSidebarOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-red-50/30 flex">
      {/* Desktop sidebar - fixed */}
      <div
        className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:z-30 lg:w-[260px] lg:border-r lg:border-gray-200 lg:bg-white lg:shadow-sm"
        style={{ width: SIDEBAR_WIDTH }}
      >
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={closeSidebar}
            aria-hidden="true"
          />
          <div
            className="fixed inset-y-0 left-0 z-50 w-[260px] max-w-[85vw] bg-white shadow-xl lg:hidden flex flex-col"
            role="dialog"
            aria-label="Menu"
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <span className="font-bold text-red-600">Menu</span>
              <button
                type="button"
                onClick={closeSidebar}
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
                aria-label="Close menu"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <Sidebar onCloseMobile={closeSidebar} />
            </div>
          </div>
        </>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-[260px]">
        {/* Top bar: menu (mobile) + title + refresh (all screens) */}
        <header className="sticky top-0 z-20 flex items-center justify-between gap-3 h-14 px-4 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 rounded-lg text-gray-600 hover:bg-gray-100"
              aria-label="Open menu"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <Link to="/dashboard" className="font-bold text-red-600 truncate">
              MADADGAAR
            </Link>
          </div>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-red-600 transition-colors"
            title="Refresh page"
            aria-label="Refresh page"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="hidden sm:inline text-sm font-medium">Refresh</span>
          </button>
        </header>

        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
