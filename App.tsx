
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
import JobVerification from './pages/Marketplace/JobVerification';
import JobDir from './pages/Marketplace/JobDir';
import { FluentProvider, webLightTheme } from "@fluentui/react-components";

const RenderLayout = ({ element }: { element: React.ReactNode }) => {
      return <Layout>{element}</Layout>
}

const App: React.FC = () => {
      return (
            <AuthProvider>
                  <FluentProvider theme={webLightTheme}>
                        <Routes>
                              <Route path="/" element={<LandingPage />} />
                              <Route path="/auth/signup" element={<Auth type="register" />} />
                              <Route path="/auth/login" element={<Auth type="login" />} />
                              <Route path="/auth/profile" element={<Auth type="profile" />} />
                              
                              <Route path='/auth/workbit/email/verified' element={<Verified />} />

                              <Route path="/dashboard" element={
                                    <ProtectedRoutes>
                                          <RenderLayout element={<Dashboard />} />
                                    </ProtectedRoutes>
                              } />
                              <Route path="/post" element={
                                    <ProtectedRoutes>
                                          <RenderLayout element={<PostJob />} />
                                    </ProtectedRoutes>
                              } />
                              <Route path="/wallet" element={<RenderLayout element={
                                    <ProtectedRoutes>
                                          <Wallet />
                                    </ProtectedRoutes>
                              } />} />
                              <Route path="/marketplace" element={<RenderLayout element={
                                    <ProtectedRoutes>
                                          <Marketplace />
                                    </ProtectedRoutes>
                              } />} />
                              <Route path="/marketplace/job_v/:job_id" element={<RenderLayout element={
                                    <ProtectedRoutes>
                                          <JobVerification />
                                    </ProtectedRoutes>
                              } />} />
                              <Route path="/marketplace/owner/:job_id" element={<RenderLayout element={
                                    <ProtectedRoutes>
                                          <JobDir />
                                    </ProtectedRoutes>
                              } />} />
                              <Route path="/marketplace/:job_id" element={<RenderLayout element={
                                    <ProtectedRoutes>
                                          <Job />
                                    </ProtectedRoutes>
                              } />} />
                        </Routes>
                  </FluentProvider>
            </AuthProvider>
      );
};

export default App;
