import React, { useState } from "react";
import { useApp } from "../AppContext";
import { Logo } from "./Logo";
import {
      LayoutDashboard,
      Briefcase,
      Wallet,
      Users,
      CreditCard,
      LogOut,
      Menu,
      X,
      Bell,
      PlusCircle,
      CheckCircle,
} from "lucide-react";
import { SIDEBAR_ICON_SIZE } from "@/constants";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/authentication";


const NavItem: React.FC<{ icon: React.ReactNode; label: string; active?: boolean; path: string; onClick?: () => void; }> = ({ icon, label, active, path, onClick }) => (
      <NavLink to={path}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-full transition-all duration-200 ${
                  active
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                        : "text-slate-600 hover:bg-slate-100 hover:text-blue-600"
            }`}
            onClick={onClick}
      >
            <div className="flex flex-col items-center justify-center relative">
                  <span>
                        {icon}
                  </span>
            </div>
            <div className="flex flex-row items-stretch justify-start flex-1">
                  <span className="text-sm">{label}</span>
            </div>
      </NavLink>
);

export const Layout: React.FC<{children: React.ReactNode}> = ({ children }) => {
      
      const { profile: user, signOut } = useAuth();
      const [isSidebarOpen, setSidebarOpen] = useState(false);

      const location = useLocation()

      const navItems = [
            {
                  id: "dashboard",
                  icon: <LayoutDashboard size={SIDEBAR_ICON_SIZE} />,
                  label: "Dashboard",
            },
            {
                  id: "marketplace",
                  icon: <Briefcase size={SIDEBAR_ICON_SIZE} />,
                  label: "Job Marketplace",
            },
            {
                  id: "post",
                  icon: <PlusCircle size={SIDEBAR_ICON_SIZE} />,
                  label: "Post a Job",
            },
            { id: "wallet", icon: <Wallet size={SIDEBAR_ICON_SIZE} />, label: "Wallet" },
            { id: "referrals", icon: <Users size={SIDEBAR_ICON_SIZE} />, label: "Referrals" },
            {
                  id: "subscription",
                  icon: <CreditCard size={SIDEBAR_ICON_SIZE} />,
                  label: "Subscription",
            },
            {
                  id: "review",
                  icon: <CheckCircle size={SIDEBAR_ICON_SIZE} />,
                  label: "Review Proofs",
            },
      ];

      const isActive = (id: string) => location.pathname.includes(id)

      const handleLogout = () => { console.log('Signout'); signOut(); };

      return (
            <div className="min-h-screen bg-slate-50 flex">
                  {/* Mobile Sidebar Overlay */}
                  {isSidebarOpen && (
                        <div
                              className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden"
                              onClick={() => setSidebarOpen(false)}
                        />
                  )}

                  {/* Sidebar */}
                  <aside className={`fixed lg:static inset-y-0 left-0 w-66 bg-white border-r border-slate-200 z-50 transition-transform duration-300 transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
                        <div className="h-full flex flex-col p-4">
                              <div className="mb-10 px-2 cursor-pointer">
                                    <Logo size="md" />
                              </div>

                              <nav className="flex-1 space-y-2">
                                    {navItems.map((item) => (
                                          <NavItem
                                                onClick={() => setSidebarOpen(false)}
                                                path={`/${item.id}`}
                                                key={item.id}
                                                icon={item.icon}
                                                label={item.label}
                                                active={isActive(item.id)}
                                          />
                                    ))}
                              </nav>

                              <div className="pt-4 border-t border-slate-100">
                                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2 rounded-full text-red-500 hover:bg-red-50 transition-colors">
                                          <LogOut size={20} />
                                          <span className="font-medium">
                                                Logout
                                          </span>
                                    </button>
                              </div>

                        </div>
                  </aside>

                  {/* Main Content */}
                  <main className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden">
                        {/* Header */}
                        <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 shrink-0">
                              <div className="flex items-center gap-4">
                                    <button className="lg:hidden p-2 text-slate-600" onClick={() => setSidebarOpen(true)}>
                                          <Menu size={24} />
                                    </button>
                                    <h1 className="text-xl font-bold text-slate-800 capitalize">
                                          {
                                                window.location.pathname.includes('marketplace') && window.location.pathname.replace('/', '').length > 'marketplace'.length ? 'Marketplace' : window.location.pathname.replace("/", " ")
                                          }
                                    </h1>
                              </div>

                              <div className="flex items-center gap-4">
                                    <button className="p-2.5 text-slate-400 hover:text-blue-600 bg-slate-50 rounded-full transition-colors relative">
                                          <Bell size={20} />
                                          <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>
                                    </button>
                                    <Link to={'/profile'} className="sm:flex items-center gap-3 pl-4 border-l border-slate-200">
                                          <div className="text-right md:block hidden">
                                                <p className="text-sm font-semibold text-slate-800">
                                                      {user?.first_name + ' ' + user?.last_name}
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                      {user?.user_contacts[0].email}
                                                </p>
                                          </div>
                                          <div className="w-10 h-10 rounded-full bg-blue-100 border-2 border-blue-50 flex items-center justify-center text-blue-600 font-bold">
                                                {user?.first_name
                                                      .charAt(0)
                                                      .toUpperCase()}
                                          </div>
                                    </Link>
                              </div>
                        </header>

                        {/* Page Content */}
                        <div className="flex-1 overflow-y-auto p-4">
                              <div className="max-w-8xl overflow-auto mx-auto space-y-4 pb-10">
                                    {children}
                              </div>
                        </div>

                  </main>
                  
            </div>
      );
};
