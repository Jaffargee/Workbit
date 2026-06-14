// import React, { useState } from "react";
// import { Logo } from "./Logo";
// import {
//       LayoutDashboard,
//       Briefcase,
//       Wallet,
//       Users,
//       CreditCard,
//       LogOut,
//       Menu,
//       X,
//       Bell,
//       PlusCircle,
//       CheckCircle,
// } from "lucide-react";
// import { SIDEBAR_ICON_SIZE } from "@/constants";
// import { Link, NavLink, useLocation } from "react-router-dom";
// import { useAuth } from "@/contexts/authentication";

// const NavItem: React.FC<{ icon: React.ReactNode; label: string; active?: boolean; path: string; onClick?: () => void; }> = ({ icon, label, active, path, onClick }) => (
//       <NavLink to={path}
//             className={`w-full flex items-center gap-3 px-4 py-2 rounded-full transition-all duration-200 ${
//                   active
//                         ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
//                         : "text-slate-600 hover:bg-slate-100 hover:text-blue-600"
//             }`}
//             onClick={onClick}
//       >
//             <div className="flex flex-col items-center justify-center relative">
//                   <span>
//                         {icon}
//                   </span>
//             </div>
//             <div className="flex flex-row items-stretch justify-start flex-1">
//                   <span className="text-sm">{label}</span>
//             </div>
//       </NavLink>
// );

// export const Layout: React.FC<{children: React.ReactNode}> = ({ children }) => {

//       const { profile: user, signOut } = useAuth();
//       const [isSidebarOpen, setSidebarOpen] = useState(false);

//       const location = useLocation()

//       const navItems = [
//             {
//                   id: "dashboard",
//                   icon: <LayoutDashboard size={SIDEBAR_ICON_SIZE} />,
//                   label: "Dashboard",
//             },
//             {
//                   id: "marketplace",
//                   icon: <Briefcase size={SIDEBAR_ICON_SIZE} />,
//                   label: "Job Marketplace",
//             },
//             {
//                   id: "post",
//                   icon: <PlusCircle size={SIDEBAR_ICON_SIZE} />,
//                   label: "Post a Job",
//             },
//             { id: "wallet", icon: <Wallet size={SIDEBAR_ICON_SIZE} />, label: "Wallet" },
//             { id: "referrals", icon: <Users size={SIDEBAR_ICON_SIZE} />, label: "Referrals" },
//             {
//                   id: "subscription",
//                   icon: <CreditCard size={SIDEBAR_ICON_SIZE} />,
//                   label: "Subscription",
//             },
//             {
//                   id: "review",
//                   icon: <CheckCircle size={SIDEBAR_ICON_SIZE} />,
//                   label: "Review Proofs",
//             },
//       ];

//       const isActive = (id: string) => location.pathname.includes(id)

//       const handleLogout = () => { console.log('Signout'); signOut(); };

//       return (
//             <div className="min-h-screen bg-slate-50 flex">
//                   {/* Mobile Sidebar Overlay */}
//                   {isSidebarOpen && (
//                         <div
//                               className="fixed inset-0 bg-slate-900/50 z-20 lg:hidden"
//                               onClick={() => setSidebarOpen(false)}
//                         />
//                   )}

//                   {/* Sidebar */}
//                   <aside className={`fixed lg:static inset-y-0 left-0 w-66 bg-white border-r border-slate-200 z-40 transition-transform duration-300 transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
//                         <div className="h-full flex flex-col p-4">
//                               <div className="mb-10 px-2 cursor-pointer">
//                                     <Logo size="md" />
//                               </div>

//                               <nav className="flex-1 space-y-2">
//                                     {navItems.map((item) => (
//                                           <NavItem
//                                                 onClick={() => setSidebarOpen(false)}
//                                                 path={`/${item.id}`}
//                                                 key={item.id}
//                                                 icon={item.icon}
//                                                 label={item.label}
//                                                 active={isActive(item.id)}
//                                           />
//                                     ))}
//                               </nav>

//                               <div className="pt-4 border-t border-slate-100">
//                                     <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2 rounded-full text-red-500 hover:bg-red-50 transition-colors">
//                                           <LogOut size={20} />
//                                           <span className="font-medium">
//                                                 Logout
//                                           </span>
//                                     </button>
//                               </div>

//                         </div>
//                   </aside>

//                   {/* Main Content */}
//                   <main className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden">
//                         {/* Header */}
//                         <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 shrink-0">
//                               <div className="flex items-center gap-4">
//                                     <button className="lg:hidden p-2 text-slate-600" onClick={() => setSidebarOpen(true)}>
//                                           <Menu size={24} />
//                                     </button>
//                                     <h1 className="text-xl font-bold text-slate-800 capitalize">
//                                           {
//                                                 window.location.pathname.includes('marketplace') && window.location.pathname.replace('/', '').length > 'marketplace'.length ? 'Marketplace' : window.location.pathname.replace("/", " ")
//                                           }
//                                     </h1>
//                               </div>

//                               <div className="flex items-center gap-4">
//                                     <button className="p-2.5 text-slate-400 hover:text-blue-600 bg-slate-50 rounded-full transition-colors relative">
//                                           <Bell size={20} />
//                                           <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>
//                                     </button>
//                                     <Link to={'/profile'} className="sm:flex items-center gap-3 pl-4 border-l border-slate-200">
//                                           <div className="text-right md:block hidden">
//                                                 <p className="text-sm font-semibold text-slate-800">
//                                                       {user?.first_name + ' ' + user?.last_name}
//                                                 </p>
//                                                 <p className="text-xs text-slate-500">
//                                                       {user?.user_contacts[0].email}
//                                                 </p>
//                                           </div>
//                                           <div className="w-10 h-10 rounded-full bg-blue-100 border-2 border-blue-50 flex items-center justify-center text-blue-600 font-bold">
//                                                 {user?.first_name
//                                                       .charAt(0)
//                                                       .toUpperCase()}
//                                           </div>
//                                     </Link>
//                               </div>
//                         </header>

//                         {/* Page Content */}
//                         <div className="flex-1 overflow-y-auto">
//                               <div className="max-w-8xl overflow-auto mx-auto space-y-4 pb-10">
//                                     {children}
//                               </div>
//                         </div>

//                   </main>

//             </div>
//       );
// };

import React, { useState } from 'react';
import { Logo } from './Logo';
import {
      makeStyles,
      mergeClasses,
      tokens,
      Button,
      Text,
      Badge,
      Avatar,
      Divider,
} from '@fluentui/react-components';
import {
      GridRegular,
      BriefcaseRegular,
      WalletRegular,
      PeopleRegular,
      CreditCardClockRegular as CreditCardRegular,
      SignOutRegular,
      NavigationRegular,
      DismissRegular,
      AlertRegular,
      AddCircleRegular,
      CheckmarkCircleRegular,
} from '@fluentui/react-icons';
import { SIDEBAR_ICON_SIZE } from '@/constants';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/authentication';

// ─── Styles ──────────────────────────────────────────────────────────────────
const useStyles = makeStyles({
      root: {
            minHeight: '100vh',
            backgroundColor: tokens.colorNeutralBackground2,
            display: 'flex',
      },

      // Overlay
      overlay: {
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.4)',
            zIndex: 20,
            '@media (min-width: 1024px)': { display: 'none' },
      },

      // Sidebar
      sidebar: {
            position: 'fixed',
            top: 0,
            bottom: 0,
            left: 0,
            width: '264px',
            backgroundColor: tokens.colorNeutralBackground1,
            borderRight: `1px solid ${tokens.colorNeutralStroke2}`,
            zIndex: 40,
            transition: 'transform 0.3s ease',
            display: 'flex',
            flexDirection: 'column',
            '@media (min-width: 1024px)': {
                  position: 'static',
                  transform: 'none !important',
            },
      },

      sidebarOpen: { transform: 'translateX(0)' },
      sidebarClosed: { transform: 'translateX(-100%)' },

      sidebarInner: {
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            padding: '16px',
      },

      logoArea: {
            marginBottom: '32px',
            paddingLeft: '8px',
            paddingRight: '8px',
            cursor: 'pointer',
      },

      nav: {
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
      },

      navItem: {
            width: '100%',
            justifyContent: 'flex-start',
            borderRadius: tokens.borderRadiusCircular,
            paddingLeft: '16px',
            paddingRight: '16px',
            paddingTop: '8px',
            paddingBottom: '8px',
            gap: '12px',
            fontWeight: tokens.fontWeightRegular,
            color: tokens.colorNeutralForeground2,
            backgroundColor: 'transparent',
            border: 'none',
            transition: 'background 0.15s, color 0.15s',
            ':hover': {
                  backgroundColor: tokens.colorNeutralBackground1Hover,
                  color: tokens.colorBrandForeground1,
            },
      },

      navItemActive: {
            backgroundColor: tokens.colorBrandBackground,
            color: tokens.colorNeutralForegroundOnBrand,
            ':hover': {
                  backgroundColor: tokens.colorBrandBackgroundHover,
                  color: tokens.colorNeutralForegroundOnBrand,
            },
      },

      sidebarFooter: {
            paddingTop: '16px',
      },

      logoutBtn: {
            width: '100%',
            justifyContent: 'flex-start',
            borderRadius: tokens.borderRadiusCircular,
            paddingLeft: '16px',
            paddingRight: '16px',
            color: tokens.colorStatusDangerForeground1,
            backgroundColor: 'transparent',
            border: 'none',
            gap: '12px',
            ':hover': {
                  backgroundColor: tokens.colorStatusDangerBackground1,
            },
      },

      // Main
      main: {
            flex: 1,
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            overflow: 'hidden',
      },

      // Header
      header: {
            height: '56px',
            backgroundColor: tokens.colorNeutralBackground1,
            borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingLeft: '16px',
            paddingRight: '16px',
            flexShrink: 0,
      },

      headerLeft: {
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
      },

      mobileMenuBtn: {
            '@media (min-width: 1024px)': { display: 'none' },
      },

      pageTitle: {
            fontSize: tokens.fontSizeBase500,
            fontWeight: tokens.fontWeightSemibold,
            color: tokens.colorNeutralForeground1,
            textTransform: 'capitalize',
      },

      headerRight: {
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
      },

      bellBtn: {
            position: 'relative',
            borderRadius: tokens.borderRadiusCircular,
      },

      bellBadge: {
            position: 'absolute',
            top: '6px',
            right: '8px',
      },

      profileLink: {
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            paddingLeft: '16px',
            borderLeft: `1px solid ${tokens.colorNeutralStroke2}`,
            textDecoration: 'none',
      },

      profileText: {
            textAlign: 'right',
            display: 'none',
            '@media (min-width: 768px)': { display: 'block' },
      },

      profileName: {
            fontSize: tokens.fontSizeBase200,
            fontWeight: tokens.fontWeightSemibold,
            color: tokens.colorNeutralForeground1,
      },

      profileEmail: {
            fontSize: tokens.fontSizeBase100,
            color: tokens.colorNeutralForeground3,
      },

      // Content
      contentWrapper: {
            flex: 1,
            overflowY: 'auto',
      },

      contentInner: {
            maxWidth: '100%',
            overflowX: 'auto',
            marginLeft: 'auto',
            marginRight: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            paddingBottom: '40px',
      },
});

// ─── NavItem ─────────────────────────────────────────────────────────────────
const NavItem: React.FC<{
      icon: React.ReactNode;
      label: string;
      active?: boolean;
      path: string;
      onClick?: () => void;
}> = ({ icon, label, active, path, onClick }) => {
      const styles = useStyles();

      return (
            <NavLink
                  to={path}
                  style={{ textDecoration: 'none' }}
                  onClick={onClick}
            >
                  <Button
                        appearance="subtle"
                        icon={icon as React.ReactElement}
                        // className={`${styles.navItem} ${true ? styles.navItemActive : ""}`}
                        className={mergeClasses(
                              styles.navItem,
                              active && styles.navItemActive
                        )}
                  >
                        {label}
                  </Button>
            </NavLink>
      );
};

// ─── Layout ──────────────────────────────────────────────────────────────────

export const Layout: React.FC<{ children: React.ReactNode }> = ({
      children,
}) => {
      const { profile: user, signOut } = useAuth();
      const [isSidebarOpen, setSidebarOpen] = useState(false);
      const location = useLocation();

      const navItems = [
            {
                  id: 'dashboard',
                  icon: <GridRegular fontSize={SIDEBAR_ICON_SIZE} />,
                  label: 'Dashboard',
            },
            {
                  id: 'marketplace',
                  icon: <BriefcaseRegular fontSize={SIDEBAR_ICON_SIZE} />,
                  label: 'Job Marketplace',
            },
            {
                  id: 'post',
                  icon: <AddCircleRegular fontSize={SIDEBAR_ICON_SIZE} />,
                  label: 'Post a Job',
            },
            {
                  id: 'wallet',
                  icon: <WalletRegular fontSize={SIDEBAR_ICON_SIZE} />,
                  label: 'Wallet',
            },
            {
                  id: 'referrals',
                  icon: <PeopleRegular fontSize={SIDEBAR_ICON_SIZE} />,
                  label: 'Referrals',
            },
            {
                  id: 'subscription',
                  icon: <CreditCardRegular fontSize={SIDEBAR_ICON_SIZE} />,
                  label: 'Subscription',
            },
            {
                  id: 'review',
                  icon: <CheckmarkCircleRegular fontSize={SIDEBAR_ICON_SIZE} />,
                  label: 'Review Proofs',
            },
      ];

      const isActive = (id: string) => location.pathname.includes(id);

      const pageTitle = (() => {
            const path = window.location.pathname;
            if (
                  path.includes('marketplace') &&
                  path.replace('/', '').length > 'marketplace'.length
            ) {
                  return 'Marketplace';
            }
            return path.replace('/', ' ').trim();
      })();

      const styles = useStyles();

      return (
            <div className={styles.root}>
                  {/* Mobile overlay */}
                  {isSidebarOpen && (
                        <div
                              className={styles.overlay}
                              onClick={() => setSidebarOpen(false)}
                        />
                  )}

                  {/* Sidebar */}
                  <aside
                        className={`${styles.sidebar} ${
                              isSidebarOpen
                                    ? styles.sidebarOpen
                                    : styles.sidebarClosed
                        }`}
                  >
                        <div className={styles.sidebarInner}>
                              <div className={styles.logoArea}>
                                    <Logo size="md" />
                              </div>

                              <nav className={styles.nav}>
                                    {navItems.map((item) => (
                                          <NavItem
                                                key={item.id}
                                                path={`/${item.id}`}
                                                icon={item.icon}
                                                label={item.label}
                                                active={isActive(item.id)}
                                                onClick={() =>
                                                      setSidebarOpen(false)
                                                }
                                          />
                                    ))}
                              </nav>

                              <div className={styles.sidebarFooter}>
                                    <Divider style={{ marginBottom: '12px' }} />
                                    <Button
                                          appearance="subtle"
                                          icon={
                                                <SignOutRegular fontSize={20} />
                                          }
                                          className={styles.logoutBtn}
                                          onClick={() => {
                                                console.log('Signout');
                                                signOut();
                                          }}
                                    >
                                          Logout
                                    </Button>
                              </div>
                        </div>
                  </aside>

                  {/* Main */}
                  <main className={styles.main}>
                        {/* Header */}
                        <header className={styles.header}>
                              <div className={styles.headerLeft}>
                                    <Button
                                          appearance="subtle"
                                          icon={
                                                <NavigationRegular
                                                      fontSize={24}
                                                />
                                          }
                                          className={styles.mobileMenuBtn}
                                          onClick={() => setSidebarOpen(true)}
                                    />
                                    <Text className={styles.pageTitle}>
                                          {pageTitle}
                                    </Text>
                              </div>

                              <div className={styles.headerRight}>
                                    {/* Bell */}
                                    <div style={{ position: 'relative' }}>
                                          <Button
                                                appearance="subtle"
                                                icon={
                                                      <AlertRegular
                                                            fontSize={20}
                                                      />
                                                }
                                                shape="circular"
                                                className={styles.bellBtn}
                                          />
                                          <Badge
                                                size="tiny"
                                                color="danger"
                                                className={styles.bellBadge}
                                                style={{
                                                      position: 'absolute',
                                                      top: 6,
                                                      right: 8,
                                                }}
                                          />
                                    </div>

                                    {/* Profile */}
                                    <Link
                                          to="/profile"
                                          className={styles.profileLink}
                                    >
                                          <div className={styles.profileText}>
                                                <Text
                                                      className={
                                                            styles.profileName
                                                      }
                                                      block
                                                >
                                                      {user?.first_name +
                                                            ' ' +
                                                            user?.last_name}
                                                </Text>
                                                <Text
                                                      className={
                                                            styles.profileEmail
                                                      }
                                                      block
                                                >
                                                      {
                                                            user
                                                                  ?.user_contacts[0]
                                                                  .email
                                                      }
                                                </Text>
                                          </div>
                                          <Avatar
                                                name={
                                                      user?.first_name +
                                                      ' ' +
                                                      user?.last_name
                                                }
                                                size={36}
                                                color="brand"
                                          />
                                    </Link>
                              </div>
                        </header>

                        {/* Page content */}
                        <div className={styles.contentWrapper}>
                              <div className={styles.contentInner}>
                                    {children}
                              </div>
                        </div>
                  </main>
            </div>
      );
};
