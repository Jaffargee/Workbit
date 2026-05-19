import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import AuthProvider, { useAuth } from './authentication';

// ============================================
// LAZY LOADED COMPONENTS (Performance optimization)
// ============================================

// Public pages
const LandingPage = lazy(() => import('@/pages/LandingPage'));
const Auth = lazy(() => import('@/pages/Auth'));
const Verified = lazy(() => import('@/pages/Auth/Verified'));

// Protected pages
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Marketplace = lazy(() => import('@/pages/Marketplace'));
const PostJob = lazy(() => import('@/pages/PostJob'));
const Referrals = lazy(() => import('@/pages/Referrals'));
const ReviewProofs = lazy(() => import('@/pages/ReviewProofs'));
const Subscription = lazy(() => import('@/pages/Subscription'));
const Wallet = lazy(() => import('@/pages/Wallet'));
// const SetupProfile = lazy(() => import('@/pages/SetupProfile'));

// Error pages
// const NotFound = lazy(() => import('@/pages/NotFound'));
// const Unauthorized = lazy(() => import('@/pages/Unauthorized'));

// ============================================
// LOADING COMPONENTS
// ============================================

const PageLoader: React.FC = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <div className="text-center space-y-4">
      <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
);

const AuthLoader: React.FC = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <div className="text-center space-y-4">
      <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
      <p className="text-gray-600">Checking authentication...</p>
    </div>
  </div>
);

// ============================================
// PROTECTED ROUTE COMPONENT
// ============================================

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireProfile?: boolean;
  requiredRole?: string;
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireProfile = true,
  requiredRole,
  redirectTo = '/auth/login',
}) => {
  const { isAuthenticated, loading, user, profile } = useAuth();
  const location = useLocation();

  // Show loader while checking authentication
  if (loading) {
    return <AuthLoader />;
  }

  // Not authenticated - redirect to login with return URL
  if (!isAuthenticated || !user) {
    return (
      <Navigate
        to={redirectTo}
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  // Check if profile is required but missing
  if (requireProfile && !profile) {
    // Don't redirect if already on profile setup page
    if (location.pathname !== '/auth/setup-profile') {
      return (
        <Navigate
          to="/auth/setup-profile"
          state={{ from: location.pathname }}
          replace
        />
      );
    }
  }



  // All checks passed - render the protected content
  return <>{children}</>;
};

// ============================================
// PUBLIC ROUTE COMPONENT (Redirect if already logged in)
// ============================================

interface PublicRouteProps {
  children: React.ReactNode;
  redirectIfAuthenticated?: boolean;
  redirectTo?: string;
}

const PublicRoute: React.FC<PublicRouteProps> = ({
  children,
  redirectIfAuthenticated = true,
  redirectTo = '/dashboard',
}) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Show loader while checking authentication
  if (loading) {
    return <AuthLoader />;
  }

  // Already authenticated - redirect to dashboard
  if (redirectIfAuthenticated && isAuthenticated) {
    // Check if there's a return URL from previous navigation
    const from = (location.state as any)?.from || redirectTo;
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
};

// ============================================
// PAGE WRAPPER COMPONENT (Replaces RenderPageComponent)
// ============================================

interface PageWrapperProps {
  children: React.ReactNode;
  title?: string;
  currentPage?: string;
}

const PageWrapper: React.FC<PageWrapperProps> = ({
  children,
  title,
  currentPage,
}) => {
  // Set page title
  React.useEffect(() => {
    if (title) {
      document.title = `${title} | WorkBit`;
    }
  }, [title]);

  // Track page view (analytics)
  React.useEffect(() => {
    if (currentPage) {
      // Example: Google Analytics
      // gtag('event', 'page_view', { page_path: currentPage });
      console.log('[Analytics] Page view:', currentPage);
    }
  }, [currentPage]);

  return <div className="page-wrapper">{children}</div>;
};

// ============================================
// MAIN APP ROUTER
// ============================================

const AppRouter: React.FC = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* ============================================ */}
        {/* PUBLIC ROUTES */}
        {/* ============================================ */}

        <Route
          index
          path="/"
          element={
            <PublicRoute redirectIfAuthenticated={false}>
              <PageWrapper title="Home" currentPage="/">
                <LandingPage />
              </PageWrapper>
            </PublicRoute>
          }
        />

        {/* Auth routes - redirect if already logged in */}
        <Route
          path="/auth/login"
          element={
            <PublicRoute>
              <PageWrapper title="Login" currentPage="/auth/login">
                <Auth type="login" />
              </PageWrapper>
            </PublicRoute>
          }
        />

        <Route
          path="/auth/signup"
          element={
            <PublicRoute>
              <PageWrapper title="Sign Up" currentPage="/auth/signup">
                <Auth type="register" />
              </PageWrapper>
            </PublicRoute>
          }
        />

        {/* Email verification - accessible without full auth */}
        <Route
          path="/auth/workbit/email/verified"
          element={
            <PageWrapper title="Email Verified" currentPage="/auth/verified">
              <Verified />
            </PageWrapper>
          }
        />

        {/* Profile setup - requires auth but not profile */}
        <Route
          path="/auth/setup-profile"
          element={
            <ProtectedRoute requireProfile={false}>
              <PageWrapper title="Setup Profile" currentPage="/auth/setup-profile">
                <Auth type="profile" />
              </PageWrapper>
            </ProtectedRoute>
          }
        />

        {/* ============================================ */}
        {/* PROTECTED ROUTES */}
        {/* ============================================ */}

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <PageWrapper title="Dashboard" currentPage="/dashboard">
                <Dashboard onPageChange={() => {}} />
              </PageWrapper>
            </ProtectedRoute>
          }
        />

        <Route
          path="/marketplace"
          element={
            <ProtectedRoute>
              <PageWrapper title="Marketplace" currentPage="/marketplace">
                <Marketplace />
              </PageWrapper>
            </ProtectedRoute>
          }
        />

        <Route
          path="/postjob"
          element={
            <ProtectedRoute>
              <PageWrapper title="Post a Job" currentPage="/postjob">
                <PostJob />
              </PageWrapper>
            </ProtectedRoute>
          }
        />

        <Route
          path="/referrals"
          element={
            <ProtectedRoute>
              <PageWrapper title="Referrals" currentPage="/referrals">
                <Referrals />
              </PageWrapper>
            </ProtectedRoute>
          }
        />

        <Route
          path="/review"
          element={
            <ProtectedRoute requiredRole="admin">
              <PageWrapper title="Review Proofs" currentPage="/review">
                <ReviewProofs />
              </PageWrapper>
            </ProtectedRoute>
          }
        />

        <Route
          path="/subscription"
          element={
            <ProtectedRoute>
              <PageWrapper title="Subscription" currentPage="/subscription">
                <Subscription />
              </PageWrapper>
            </ProtectedRoute>
          }
        />

        <Route
          path="/wallet"
          element={
            <ProtectedRoute>
              <PageWrapper title="Wallet" currentPage="/wallet">
                <Wallet />
              </PageWrapper>
            </ProtectedRoute>
          }
        />

        {/* ============================================ */}
        {/* ERROR ROUTES */}
        {/* ============================================ */}

        {/* <Route
          path="/unauthorized"
          element={
            <PageWrapper title="Unauthorized" currentPage="/unauthorized">
              <Unauthorized />
            </PageWrapper>
          }
        /> */}

        {/* 404 - Catch all unmatched routes */}
        {/* <Route
          path="*"
          element={
            <PageWrapper title="Not Found" currentPage="/404">
              <NotFound />
            </PageWrapper>
          }
        /> */}
      </Routes>
    </Suspense>
  );
};

// ============================================
// MAIN APP COMPONENT
// ============================================

const App: React.FC = () => {
  return (
    <AuthProvider>
      {/* <AppProvider> */}
        <AppRouter />
      {/* </AppProvider> */}
    </AuthProvider>
  );
};

export default App;

// ============================================
// ADDITIONAL UTILITY: ROUTE GUARDS HOOK
// ============================================

/**
 * Custom hook for programmatic navigation with auth checks
 * Usage: const { navigateProtected } = useProtectedNavigation();
 */
export const useProtectedNavigation = () => {
  const { isAuthenticated, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navigateProtected = React.useCallback(
    (to: string, options?: { requireProfile?: boolean; requiredRole?: string }) => {
      if (!isAuthenticated) {
        navigate('/auth/login', { state: { from: location.pathname } });
        return false;
      }

      if (options?.requireProfile && !profile) {
        navigate('/auth/setup-profile', { state: { from: to } });
        return false;
      }

      navigate(to);
      return true;
    },
    [isAuthenticated, profile, navigate, location]
  );

  return { navigateProtected };
};

// ============================================
// EXAMPLE USAGE IN COMPONENTS
// ============================================

/*
// In a button component:
import { useProtectedNavigation } from '@/App';

function MyComponent() {
  const { navigateProtected } = useProtectedNavigation();

  const handlePostJob = () => {
    navigateProtected('/postjob', { requireProfile: true });
  };

  const handleAdminPanel = () => {
    navigateProtected('/admin', { requiredRole: 'admin' });
  };

  return (
    <>
      <button onClick={handlePostJob}>Post a Job</button>
      <button onClick={handleAdminPanel}>Admin Panel</button>
    </>
  );
}
*/