
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import AuthProvider from './contexts/authentication';
import { Layout } from './components/Layout';
import PostJob from './pages/PostJob';
import Wallet from './pages/Wallet';
import Marketplace from './pages/Marketplace';
import Job from './pages/Marketplace/Job';
import ProtectedRoutes from './contexts/protected_routes';
import Verified from './pages/Auth/Verified';
import JobVerification from './pages/Jobs/JobVerification'
import JobDir from './pages/Jobs/JobDir';
import Jobs from './pages/Jobs';
import { FluentProvider, webLightTheme } from "@fluentui/react-components";

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
                                    <ProtectedRoutes>
                                          <Auth type="register" />
                                    </ProtectedRoutes>
                              } />
                              <Route path="/auth/login" element={
                                    <ProtectedRoutes>
                                          <Auth type="login" />
                                    </ProtectedRoutes>
                              } />
                              <Route path="/auth/profile" element={
                                    <ProtectedRoutes>
                                          <Auth type="profile" />
                                    </ProtectedRoutes>
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
                                          <RenderLayout element={<Wallet />} />
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
                        </Routes>
                  </FluentProvider>
            </AuthProvider>
      );
};

export default App;
