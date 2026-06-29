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
            // {
            //       id: 'post',
            //       icon: <AddCircleRegular fontSize={SIDEBAR_ICON_SIZE} />,
            //       label: 'Post a Job',
            // },
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
            {
                  id: 'jobs',
                  icon: <BriefcaseRegular fontSize={SIDEBAR_ICON_SIZE} />,
                  label: 'Jobs',
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
