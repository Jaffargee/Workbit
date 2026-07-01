
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import AuthProvider from './contexts/authentication';
import { Layout } from './components/Layout';
import PostJob from './pages/PostJob';
import WalletProps from './pages/Wallet';
import Marketplace from './pages/Marketplace';
import Job from './pages/Marketplace/Job';
import ProtectedRoutes from './contexts/protected_routes';
import Verified from './pages/Auth/Verified';
import JobVerification from './pages/Jobs/JobVerification'
import JobDir from './pages/Jobs/JobDir';
import Jobs from './pages/Jobs';
import { FluentProvider, webLightTheme } from "@fluentui/react-components";
import Test from './pages/Test';
import Privacypolicy from './pages/Static/Privacypolicy';
import TermsOfService from './pages/Static/Termofservice';
// import PrivacyPolicy from './pages/Static/PrivacyPolicy';
import HelpCenter from './pages/Static/Helpcenter';
import ContactUs from './pages/Static/Contactus';
import RefundPolicy from './pages/Static/Refundpolicy';
import NotFound from './pages/Static/Notfound';

const RenderLayout = ({ element }: { element: React.ReactNode }) => {
      return <Layout>{element}</Layout>
}

const customTheme = {
      ...webLightTheme, // or webLightTheme
      fontFamilyBase: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      fontFamilyMonospace: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
      fontFamilyNumeric: "'Inter', sans-serif",
};


const App: React.FC = () => {
      return (
            <AuthProvider>
                  <FluentProvider theme={customTheme}>
                        <Routes>
                              <Route path="/" element={<LandingPage />} />
                              <Route path="/auth/signup" element={
                                    // <ProtectedRoutes>
                                          <Auth type="register" />
                                    // {/* </ProtectedRoutes> */}
                              } />
                              <Route path="/auth/login" element={
                                    // <ProtectedRoutes>
                                          <Auth type="login" />
                                    // </ProtectedRoutes>
                              } />
                              <Route path="/auth/profile" element={
                                    // <ProtectedRoutes>
                                          <Auth type="profile" />
                                    // </ProtectedRoutes>
                              } />
                              
                              <Route path='/auth/workbit/email/verified' element={<Verified />} />

                              <Route path="/dashboard" element={
                                    <ProtectedRoutes>
                                          <RenderLayout element={<Dashboard />} />
                                    </ProtectedRoutes>
                              } />
                              <Route path="/jobs/post" element={
                                    <ProtectedRoutes>
                                          <RenderLayout element={<PostJob />} />
                                    </ProtectedRoutes>
                              } />
                              <Route path="/wallet" element={
                                    <ProtectedRoutes>
                                          <RenderLayout element={<WalletProps />} />
                                    </ProtectedRoutes>
                              } />
                              <Route path="/marketplace" element={
                                    <ProtectedRoutes>
                                          <RenderLayout element={<Marketplace />} />
                                    </ProtectedRoutes>
                              } />
                              <Route path="/jobs/owner/:job_id/verify" element={
                                    <ProtectedRoutes>
                                          <RenderLayout element={<JobVerification />} />
                                    </ProtectedRoutes>
                              } />
                              <Route path="/jobs/owner/:job_id" element={
                                    <ProtectedRoutes>
                                          <RenderLayout element={<JobDir />} />
                                    </ProtectedRoutes>
                              } />
                              <Route path="/marketplace/:job_id" element={
                                    <ProtectedRoutes>
                                          <RenderLayout element={<Job />} />
                                    </ProtectedRoutes>
                              } />
                              <Route path="/jobs" element={
                                    <ProtectedRoutes>
                                          <RenderLayout element={<Jobs />} />
                                    </ProtectedRoutes>
                              } />
                              <Route path="/test" element={
                                    <ProtectedRoutes>
                                          <RenderLayout element={<Test />} />
                                    </ProtectedRoutes>
                              } />

                              {/* ── Static / support pages ─────────────── */}
                              <Route path="/terms" element={<TermsOfService />} />
                              <Route path="/privacy" element={<Privacypolicy />} />
                              <Route path="/help" element={<HelpCenter />} />
                              <Route path="/contact" element={<ContactUs />} />
                              <Route path="/refunds" element={<RefundPolicy />} />
 
                              {/* ── 404 catch-all ──────────────────────── */}
                              <Route path="*" element={<NotFound />} />
                        </Routes>
                  </FluentProvider>
            </AuthProvider>
      );
};

export default App;
